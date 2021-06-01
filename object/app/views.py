from flask import url_for, redirect, render_template, flash, g, session
from app import app


@app.route('/upload')
def upload():
    return render_template('index.html')


@app.route('/download')
def download():
    return render_template('list.html')
