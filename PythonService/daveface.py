from flask import Flask, jsonify, abort, make_response, request
import trainer, predictor

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
    print("Predicting started...")
    returnValue = "Fail..."
    
    requestData = request.get_json()
    
    if not requestData or not 'image' in requestData:
        print("Invalid JSON request data...", returnValue)
        abort(400)
        
    image = requestData["image"]
    
    success, predictions, error = predictor.predict(image)
    code = 400
    
    if success:
        returnValue = "Success!"
        code = 201

    print("Predicting ended...", returnValue)
    
    return jsonify({
            'success': success,
            'predictions': predictions,
            'error': error
            }), code
    
    
@app.route('/daveface/getmodels', methods=['GET'])
def getmodels():
    return jsonify({
        'success': True
    })


if __name__ == '__main__':
    app.run(debug=True)