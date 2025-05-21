from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS
from api import api_bp

app = Flask(__name__)
CORS(app)


app.register_blueprint(api_bp)                  


@app.route('/')
def home():
    return send_from_directory(os.path.join(app.root_path, 'public'), 'index.html')

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory(os.path.join(app.root_path, 'public', 'assets'), filename)


if __name__ == '__main__':
    app.run(port=5000, debug=True) 