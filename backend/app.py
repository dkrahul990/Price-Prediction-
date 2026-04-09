from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import joblib
import pandas as pd
import os
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

db_path = os.path.join(os.path.dirname(__file__), 'insurance.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    purchases = db.relationship('Purchase', backref='user', lazy=True)

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    insurance_type = db.Column(db.String(50), default='Medical') # 'Medical' or 'Life'
    base_charge = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(500), nullable=True)
    terms = db.Column(db.String(1000), nullable=True)

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    insurance_type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

try:
    model_path = os.path.join(os.path.dirname(__file__), 'insurance_model.pkl')
    model = joblib.load(model_path)
except Exception as e:
    model = None
    print("Could not load model:", e)

REGION_MAP = {'northeast': 0, 'northwest': 1, 'southeast': 2, 'southwest': 3}

with app.app_context():
    db.create_all()
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', password=generate_password_hash('admin123'), role='admin')
        db.session.add(admin)
        db.session.commit()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and check_password_hash(user.password, data.get('password')):
        return jsonify({'success': True, 'id': user.id, 'username': user.username, 'role': user.role})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'success': False, 'message': 'User already exists'}), 400
    user = User(username=data.get('username'), password=generate_password_hash(data.get('password')), role=data.get('role', 'user'))
    db.session.add(user)
    db.session.commit()
    return jsonify({'success': True, 'id': user.id, 'username': user.username, 'role': user.role})

@app.route('/companies', methods=['GET'])
def get_companies():
    companies = Company.query.all()
    return jsonify([{
        'id': c.id, 'name': c.name, 'insurance_type': c.insurance_type,
        'base_charge': c.base_charge, 'rating': c.rating, 
        'description': c.description, 'terms': c.terms
    } for c in companies])

@app.route('/companies/<int:company_id>', methods=['GET'])
def get_company(company_id):
    c = Company.query.get(company_id)
    if not c: return jsonify({'success': False, 'message': 'Not found'}), 404
    return jsonify({
        'success': True,
        'company': {
            'id': c.id, 'name': c.name, 'insurance_type': c.insurance_type,
            'base_charge': c.base_charge, 'rating': c.rating, 
            'description': c.description, 'terms': c.terms
        }
    })

@app.route('/companies', methods=['POST'])
def add_company():
    data = request.json
    comp = Company(
        name=data.get('name'), 
        insurance_type=data.get('insurance_type', 'Medical'),
        base_charge=float(data.get('base_charge')),
        rating=float(data.get('rating', 5.0)), 
        description=data.get('description'),
        terms=data.get('terms', 'Standard T&C apply.')
    )
    db.session.add(comp)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        age, bmi = float(data.get('age', 30)), float(data.get('bmi', 25))
        children, smoker, sex = int(float(data.get('children', 0))), int(float(data.get('smoker', 0))), int(float(data.get('sex', 0)))
        region_str = data.get("region", "northeast").lower().strip()
        region = REGION_MAP.get(region_str, 0)
        
        X_df = pd.DataFrame([{"age": age, "sex": sex, "bmi": bmi, "children": children, "smoker": smoker, "region": region}])
        pred = model.predict(X_df)[0] if model else 13000.0
            
        recommendation = None
        companies = Company.query.filter_by(insurance_type='Medical').all()
        if companies:
            closest = min(companies, key=lambda c: abs(c.base_charge - float(pred)))
            recommendation = {
                'id': closest.id, 'name': closest.name, 'insurance_type': closest.insurance_type,
                'rating': closest.rating, 'base_charge': closest.base_charge,
                'description': closest.description, 'terms': closest.terms
            }
        return jsonify({'prediction': float(pred), 'success': True, 'recommendation': recommendation})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400

@app.route('/buy', methods=['POST'])
def buy():
    data = request.json
    try:
        user = User.query.filter_by(username=data.get('username')).first()
        if not user: return jsonify({'success': False, 'message': 'User not found'}), 404
        
        purchase = Purchase(
            user_id=user.id,
            company_name=data.get('company_name'),
            insurance_type=data.get('insurance_type', "Medical"),
            price=float(data.get('price')),
            payment_method=data.get('payment_method')
        )
        db.session.add(purchase)
        db.session.commit()
        return jsonify({'success': True, 'message': f"Successfully purchased {purchase.insurance_type} cover from {purchase.company_name} via {purchase.payment_method}!"})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/user/dashboard', methods=['POST'])
def user_dashboard():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if not user: return jsonify({'success': False, 'message': 'User not found'}), 404
    
    auth_data = {
        'username': user.username,
        'role': user.role,
        'purchases': [{
            'id': p.id,
            'company_name': p.company_name,
            'insurance_type': p.insurance_type,
            'price': p.price,
            'payment_method': p.payment_method,
            'date': p.date.strftime("%Y-%m-%d %H:%M")
        } for p in user.purchases]
    }
    return jsonify({'success': True, 'dashboard': auth_data})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
