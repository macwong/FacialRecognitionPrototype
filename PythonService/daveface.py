from flask import Flask, jsonify, abort, make_response, request
import trainer, predictor

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/train')
def train():
    if trainer.train():
        return "Success!"
    else:
        return "Fail..."

@app.route('/predict')
def predict():
    if predictor.predict():
        return "Success!"
    else:
        return "Fail..."

if __name__ == '__main__':
    app.run(debug=True)