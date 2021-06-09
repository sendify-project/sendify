from flask import Flask, redirect
from app import views
from .views import upload
from flask_swagger_ui import get_swaggerui_blueprint

app = Flask(__name__)
app.register_blueprint(upload)

app.config.from_object('config.default')
app.config.from_envvar('APP_CONFIG_FILE', silent=True)


if app.config.get('SWAGGERUI') == "enabled":
    SWAGGER_URL = '/swagger'
    API_URL = '/static/swagger.yaml'
    SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "s3 uploader"
        }
    )
    app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)

    @app.route('/')
    def hello():
        return redirect("/swagger", code=302)
