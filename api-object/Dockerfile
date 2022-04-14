FROM python:3.7.4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY requirements.txt /usr/src/app/
RUN pip install --retries 10 --timeout 120 --no-cache-dir -r requirements.txt

COPY . /usr/src/app

CMD gunicorn --access-logfile - -c gunicorn_config.py app:app
