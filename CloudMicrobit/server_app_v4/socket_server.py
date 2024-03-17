import asyncio
import websockets

servers = []
clients = []

PRINT_MESSAGES = False
HOST = "0.0.0.0"
PORT = 8080

async def handle_connections(websocket):
    name = await websocket.recv()
    print(f"Connected to a {name}")

    if name == "server":
        servers.append(websocket)
    elif name == "client":
        clients.append(websocket)
    else:
        print("Unknown type")
        return

    while True:
        try:
            message = await asyncio.wait_for(websocket.recv(), timeout=0.5)
        except asyncio.TimeoutError:
            continue
        except websockets.ConnectionClosed:
            print(f"Connection closed: {websocket.remote_address}")
            if websocket in clients:
                clients.remove(websocket)
            elif websocket in servers:
                servers.remove(websocket)
            return
        
        if PRINT_MESSAGES:
            print(f"Received: {message}")

        if websocket in clients:
            for server in servers:
                if PRINT_MESSAGES:
                    print(f">>> {message} sent to server {server.remote_address}        ", end="\r")
                await server.send(message)


async def main():
    print(f"Starting server on {HOST}:{PORT}")
    async with websockets.serve(handle_connections, HOST, PORT):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Exiting")
        exit(0)
