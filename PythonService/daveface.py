from flask import Flask, jsonify, abort, make_response, request
import trainer, predictor

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/train', methods=['POST'])
def train():
    print("Training started...")
    returnValue = "Fail..."

    requestData = request.get_json()
    
    if not requestData or not 'folder' in requestData:
        print("Invalid JSON request data...", returnValue)
        abort(400)

    folder = requestData['folder']
    print("Folder location:", folder)
    
    if trainer.train(folder):
        returnValue = "Success!"
        
    print("Training ended...", returnValue)
        
    return returnValue


@app.route('/predict')
def predict():
    if predictor.predict():
        return "Success!"
    else:
        return "Fail..."

if __name__ == '__main__':
    app.run(debug=True)