FROM python:3.9-slim

WORKDIR /app

RUN pip install matplotlib
RUN pip install flask
RUN pip install flask-openapi3
RUN pip install flask-cors
RUN pip install flask-socketio

COPY app.py .
COPY index.html .
COPY static .
# TODO

EXPOSE 8080

CMD ["python", "app.py"]


