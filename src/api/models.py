from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), unique=False, nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), unique=False, nullable=True)
    last_name = db.Column(db.String(120), unique=False, nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "name": self.name,
            "last_name": self.last_name,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None
        }
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self):
        return create_access_token(identity=str(self.id))