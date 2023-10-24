import socket
import threading
from time import sleep
import json
# import queue

HOST = ''
PORT = 8080

# Accept connections, if a connection sends "server" add it to the list of servers.
# Else add it to the list of clients. When a client sends a message, send it to all servers

# server_queue = queue.Queue()
servers = []
clients = []

def accept_connections(exit_flag):
    while not exit_flag.is_set():
        try:
            conn, addr = s.accept()
            conn.settimeout(0.5)
        except socket.timeout:
            continue
    
        # data = conn.recv(1024).decode()
        # if data == "server":
        #     servers.append(conn)
        # else:
        clients.append(conn)
        print("Connected to", addr)
        # conn.send("Welcome to the server!".encode())
        # conn.send(json.dumps({"message":"Welcome to the server!"}).encode())
    print("thread 1 finished")


def send_to_servers(data):
    # check if there is any data in the queue
    for server in servers:
        server.send(data.encode())


def receive_from_clients(exit_flag):
    # When receiving data from a client, send it to all servers
    while not exit_flag.is_set():
        for client in clients:
            try:
                data = client.recv(1024).decode()
            except socket.timeout:
                continue

            if not data:
                continue
            print("Received from client:", data)
            # send back
            sleep(5)
            client.send(json.dumps({"message":"123"}).encode())
            send_to_servers(data)
    
    print("thread 2 finished")


s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.settimeout(0.5)
s.listen()

exit_flag = threading.Event()
t1 = threading.Thread(target=accept_connections, args=(exit_flag,))
t1.start()
t2 = threading.Thread(target=receive_from_clients, args=(exit_flag,))
t2.start()


print("Server started")
while True:
    try:
        print(f"Servers: {len(servers)}, Clients: {len(clients)}   ", end="\r")
        sleep(1)
    except KeyboardInterrupt:
        exit_flag.set()
        break

print("Waiting for threads to finish...")
t1.join()
t2.join()


print("Closing connections...")
for server in servers:
    server.close()
for client in clients:
    client.close()
s.close()

print("Exiting...")









