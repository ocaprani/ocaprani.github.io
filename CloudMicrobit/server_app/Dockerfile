FROM python:3.9-slim

WORKDIR /app

RUN pip install matplotlib
RUN pip install flask
RUN pip install flask-openapi3
RUN pip install flask-cors

COPY app.py .
COPY index.html .
RUN mkdir plots

EXPOSE 8080

CMD ["python", "app.py"]


