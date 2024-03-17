FROM python:3.9-slim

WORKDIR /app

RUN pip install asyncio websockets

COPY socket_server.py .

EXPOSE 8080

CMD ["python", "socket_server.py"]