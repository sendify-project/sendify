from flask import Flask, redirect
from app import views
from .views import upload

app = Flask(__name__)
app.register_blueprint(upload)