from flask import Flask, jsonify, abort, make_response, request
import trainer, predictor
import os
from daveglobals import Globals

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/daveface/train', methods=['POST'])
def train():
    print("Training started...")
    returnValue = "Fail..."

    requestData = request.get_json()
    
    if (
        not requestData 
        or not 'input_folder_path' in requestData 
        or not 'model_folder_name' in requestData
    ):
        print("Invalid JSON request data...", returnValue)
        abort(400)

    input_folder_path = requestData['input_folder_path']
    model_folder_name = requestData['model_folder_name']
    
    success, error = trainer.train(input_folder_path, model_folder_name)
    code = 400
    
    if success:
        returnValue = "Success!"
        code = 201
    
        
    print("Training ended...", returnValue)
        
    return jsonify({
            'success': success,
            'error': error
            }), code


@app.route('/daveface/predict', methods=['POST'])
def predict():
    return predict_internal(predictor.predict, True)

@app.route('/daveface/predict_verbose', methods=['POST'])
def predict_verbose():
    return predict_internal(predictor.predict, True)
    

def predict_internal(predict_func, verbose):
    print("Predicting started...")
    returnValue = "Fail..."
    
    requestData = request.get_json()
    
    if (
        not requestData 
        or not 'image' in requestData
        or not 'model' in requestData
    ):
        print("Invalid JSON request data...", returnValue)
        abort(400)
        
    image = requestData["image"]
    model = requestData["model"]
    
    predict_response = predict_func(image, model, verbose)
    code = 400
    
    if predict_response.success:
        returnValue = "Success!"
        code = 201

    print("Predicting ended...", returnValue)
    
    return jsonify({
            'success': predict_response.success,
            'predictions': predict_response.predictions,
            'error': predict_response.error
            }), code

@app.route('/daveface/getmodels', methods=['GET'])
def getmodels():
    directories = [
        o
        for o in os.listdir(Globals.model_path)
        if os.path.isdir(os.path.join(Globals.model_path,o))
    ]
    
    return jsonify({
        'success': True,
        'models': directories
    })


if __name__ == '__main__':
    app.run(debug=True)