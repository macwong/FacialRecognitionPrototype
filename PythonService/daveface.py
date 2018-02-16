from flask import Flask, jsonify, abort, make_response, request

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/train')
def train():
    return "train"

@app.route('/predict')
def predict():
    return "predict"

if __name__ == '__main__':
    app.run(debug=True)