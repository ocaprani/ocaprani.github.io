# from pydantic import BaseModel
from flask_openapi3 import Info
from flask_openapi3 import OpenAPI
from flask import request
from flask_cors import CORS, cross_origin
import matplotlib
import matplotlib.pyplot as plt
import json
import sys



info = Info(title="API for airquality measurements", version="1.0.0")
app = OpenAPI(__name__, info=info)
CORS(app)

matplotlib.use('Agg')  # turn off gui

measurement_names = ["Temperatur", "Luftfugtighed", "Lufttryk", "Lydniveau"]
current_data = {"Temperatur": [], "Luftfugtighed": [], "Lufttryk": [], "Lydniveau": []}



@app.get("/")
def get_front():
    """
    Front page with graphs of measurements
    """
    with open("index.html", "r") as f:
        return f.read()



@app.get("/api/v1/sensors/airquality/temperatur")
def get_temperatur():
    """
    Get measurement for temperatur
    """
    return handle_measurement("Temperatur")

@app.get("/api/v1/sensors/airquality/luftfugtighed")
def get_luftfugtighed():
    """
    Get measurement for luftfugtighed
    """
    return handle_measurement("Luftfugtighed")

@app.get("/api/v1/sensors/airquality/lufttryk")
def get_lufttryk():
    """
    Get measurement for lufttryk
    """
    return handle_measurement("Lufttryk")

@app.get("/api/v1/sensors/airquality/lydniveau")
def get_lydniveau():
    """
    Get measurement for lydniveau
    """
    return handle_measurement("Lydniveau")


# clear current data
@app.get("/clear")
def clear_data():
    for k in current_data.keys():
        current_data[k] = []
    return "OK", 200



def handle_measurement(measurement_name):
    if "text/html" in request.headers["Accept"]:

        # data_to_send = [str(x) + "<br>" for x in ]
        data_to_send = ""
        for m in current_data[measurement_name]:
            data_to_send += str(m)[1:-1] + "<br>"
        return measurement_name + ":<br>" + str(data_to_send)

    elif "image/" in request.headers["Accept"]:
        fig, ax = plt.subplots()
        ax.plot(*zip(*current_data[measurement_name]))
        fig.autofmt_xdate(rotation=45)
        ax.set_title(measurement_name)
        plot_path = "plots/" + measurement_name + ".png"
        fig.savefig(plot_path)
        with open(plot_path, "rb") as f:
            return f.read()

    elif "application/json" in request.headers["Accept"]:
        return "Not supported", 400
        # json_to_send = json.dumps({k: v[measurement_index] for k, v in current_data.items()})
        # return json_to_send
        
    else:
        return "Not supported", 400


@app.post("/post")
def post_measurement():
    """
    Post measurement
    """
    data = request.get_json()
    # print("Data received:", data, file=sys.stderr)
    app.logger.info("Data received:", data)
    for k, v in data.items():
        current_data[k].extend(v)
    print(current_data)
    return "OK", 200



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
