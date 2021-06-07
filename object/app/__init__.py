from flask import Flask
from app import views
from .views import upload

app = Flask(__name__)
app.register_blueprint(upload)

app.config.from_object('config.default')
app.config.from_envvar('APP_CONFIG_FILE', silent=True)
