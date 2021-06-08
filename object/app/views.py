from flask import Blueprint, request, make_response, current_app
import requests
import io
import os
from botocore.client import Config
import boto3
import uuid
import datetime
import PIL.Image as Image

upload = Blueprint('upload', __name__, url_prefix='/')


@upload.route('/upload', methods=["POST"])
def files():
    file = request.files['file']

    user_id = request.headers.get('X-User-Id')
    channel_id = request.headers.get('X-Channel-Id')

    access_key = current_app.config.get("ACCESS_KEY")
    secret_key = current_app.config.get("SECRET_KEY")
    expire_days = int(current_app.config.get("EXPIRE_DAYS", "10"))
    s3_host = current_app.config.get("S3_HOST")
    print(access_key, secret_key, expire_days, s3_host)

    config = Config(signature_version='s3',
                    s3={'addressing_style': 'path'})
    s3 = boto3.resource('s3',
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        endpoint_url=s3_host,
                        config=config)

    _, file_ext = os.path.splitext(file.filename)
    file_ext = file_ext.lower().replace("jpg", "jpeg")
    img_ext_list = [".png", ".jpg", ".jpeg"]
    fid = str(uuid.uuid4())

    if file_ext in img_ext_list:
        content_type = "image/" + file_ext
        object_type = "img"
    else:
        content_type = "application/octet-stream"
        object_type = "file"

    response = s3.Bucket('sendify-object').put_object(Key=fid, Body=file, ACL='public-read', Expires=datetime.datetime.today() + datetime.timedelta(days=expire_days), ContentType=content_type).get()  # ['ResponseMetadata']['HTTPStatusCode']
    if not response:
        make_response("Something went wrong when uploading to s3", 400)

    data = {
        "type": object_type,
        "s3_url": s3_host + "/sendify-object/" + fid,
        "orginal_filename": file.filename
    }
    header = {"X-User-Id": user_id, "X-Channel-Id": channel_id}

    # TODO
    # resp = requests.post("", headers=header, data=data)
    # return make_response(resp.json(), resp.status_code)
    return make_response({"headers": header, "data": data}, 200)
