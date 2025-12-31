from flask import Flask, jsonify, request, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import os
import requests

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'super_secret_key_for_session_management' # Change this in production!
CORS(app, supports_credentials=True)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'life_tracker_v2.db') # New DB file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Configuration & Keys ---
# User provided keys
GEMINI_API_KEY = "AIzaSyB0bw8b0JlNRmnGhNG70v6LEKhRFFbQNhU"
WEATHERSTACK_API_KEY = "9f6652e1de8c2e68a2a6431a30b26f9e"

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'category': self.category,
            'date': self.date.isoformat()
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'is_completed': self.is_completed
        }

# --- Auth Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'username': user.username})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.route('/api/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    user = User.query.get(user_id)
    return jsonify({'username': user.username})

# --- Helper to get current user ---
def get_user_id():
    return session.get('user_id')

# --- Protected Data Routes ---

# serve the frontend
@app.route('/')
def index():
    return send_from_directory('.', 't.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    user_id = get_user_id()
    if not user_id: return jsonify([]), 401
    expenses = Expense.query.filter_by(user_id=user_id).order_by(Expense.date.desc()).all()
    return jsonify([e.to_dict() for e in expenses])

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    user_id = get_user_id()
    if not user_id: return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    new_expense = Expense(
        description=data['description'],
        amount=data['amount'],
        category=data['category'],
        user_id=user_id
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify(new_expense.to_dict()), 201

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    user_id = get_user_id()
    if not user_id: return jsonify({'error': 'Unauthorized'}), 401
    expense = Expense.query.get_or_404(id)
    if expense.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted'})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_id = get_user_id()
    if not user_id: return jsonify([]), 401
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([t.to_dict() for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def add_task():
    user_id = get_user_id()
    if not user_id: return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    new_task = Task(content=data['content'], user_id=user_id)
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@app.route('/api/tasks/<int:id>', methods=['PUT', 'DELETE'])
def manage_task(id):
    user_id = get_user_id()
    if not user_id: return jsonify({'error': 'Unauthorized'}), 401
    task = Task.query.get_or_404(id)
    if task.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'})
    
    data = request.json
    if 'is_completed' in data:
        task.is_completed = data['is_completed']
    db.session.commit()
    return jsonify(task.to_dict())

# --- Gemini API Proxy ---
@app.route('/api/generate', methods=['POST'])
def generate_content():
    # Allow AI usage even if simple auth is skipped for tech support, or restrict?
    # For now, let's keep it open or require auth. Let's require auth for consistency.
    user_id = get_user_id()
    if not user_id: return jsonify({'error': 'Please log in to use AI features.'}), 401

    data = request.json
    user_prompt = data.get('contents', [{}])[0].get('parts', [{}])[0].get('text', '')
    system_prompt = data.get('systemInstruction', {}).get('parts', [{}])[0].get('text', '')
    
    gemini_model = "gemini-2.0-flash-exp"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]}
    }
    
    if data.get('generationConfig'):
        payload['generationConfig'] = data['generationConfig']

    try:
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Gemini API Error: {e}")
        return jsonify({'error': str(e)}), 500

# --- Weather API Proxy ---
@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city', 'New York')
    url = f"http://api.weatherstack.com/current?access_key={WEATHERSTACK_API_KEY}&query={city}"
    try:
        response = requests.get(url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize Database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
