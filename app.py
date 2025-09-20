# app.py

from flask import Flask, jsonify, request
import datetime

# Step 1: Create Flask app
app = Flask(__name__)

# Step 2: Home route
@app.route('/')
def home():
    return "Welcome to my Flask backend!"

# Step 3: Current time API
@app.route('/time', methods=['GET'])
def get_time():
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return jsonify({'time': current_time})   # ✅ fixed error

# Step 4: Greet API with query parameter
@app.route('/greet', methods=['GET'])
def greet_user():
    name = request.args.get('name', 'Guest')  # default = Guest
    return jsonify({'message': f'Hello, {name}!'})

# Step 5: Run server
if __name__ == '__main__':
    app.run(debug=True, port=5000)
