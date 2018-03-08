import os
from pathlib import Path

class Globals():
    app_path = str(Path(os.getcwd()).parent)
    data_path = os.path.join(app_path, "data")
    model_path = os.path.join(app_path, "models")
    temp_path = os.path.join(data_path, "temp")
    current_prediction_id = 0
