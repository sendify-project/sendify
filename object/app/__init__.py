from flask import Flask
from app import views
from .views import search

app = Flask(__name__)
app.register_blueprint(search)
