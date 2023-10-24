from flask import request
from flask_cors import CORS, cross_origin
import json
from flask import Flask, render_template
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, logger=True, engineio_logger=True)
CORS(app)

user_data = {}


@app.get("/")
def get_front():
    """
    Front page with graphs of measurements
    """
    with open("index.html", "r") as f:
        return f.read()


# clear current data
@app.get("/clear")
def clear_data():
    user_data.clear()
    return "OK", 200



@app.post("/post")
def post_measurement():
    """
    Post measurement
    """
    data = request.get_json()
    # print("Data received:", data, file=sys.stderr)
    app.logger.info("Data received:", data)
    print("Data received:", data)
    
    for k, v in data.items():
        if k not in user_data:
            user_data[k] = []
        user_data[k].append(v)
    
    socketio.emit("some_event", {'data':json.dumps(data)})
    
    return "OK", 200


@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8080, debug=True, allow_unsafe_werkzeug=True)
