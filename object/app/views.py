from flask import Blueprint, request, make_response, current_app
import os
from botocore.client import Config
import boto3
import uuid
import datetime
import PIL.Image as Image
import os

upload = Blueprint('upload', __name__, url_prefix='/')


@upload.route('/upload', methods=["POST"])
def files():
    file = request.files['file']

    user_id = request.headers.get('X-User-Id')
    channel_id = request.headers.get('X-Channel-Id')

    access_key = os.environ.get("ACCESS_KEY")
    secret_key = os.environ.get("SECRET_KEY")
    expire_days = int(os.environ.get("EXPIRE_DAYS", "10"))
    s3_host = os.environ.get("S3_HOST")
    s3_bucket = os.environ.get("S3_BUCKET")
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

    response = s3.Bucket(s3_bucket).put_object(Key=fid, Body=file, ACL='public-read', Expires=datetime.datetime.today() + datetime.timedelta(days=expire_days), ContentType=content_type).get()  # ['ResponseMetadata']['HTTPStatusCode']
    if not response:
        make_response("Something went wrong when uploading to s3", 400)

    data = {
        "type": object_type,
        "s3_url": s3_host + "/" + s3_bucket + "/" + fid,
        "orginal_filename": file.filename
    }
    resp = make_response(data, 200)
    resp.headers["X-User-Id"] = user_id
    resp.headers["X-Channel-Id"] = channel_id
    return resp
