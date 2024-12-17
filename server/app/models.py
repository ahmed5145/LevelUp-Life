from .config import db, mm
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class Users(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    google_id = db.Column(db.String, unique=True, nullable=True)  # Nullable for email-password users
    username = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=True)
    password_hash = db.Column(db.String, nullable=True)  # Hashed password
    level = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    coins = db.Column(db.Integer, default=0)
    avatar= db.Column(db.String, default="14p.png",nullable=False)
    frame= db.Column(db.String, default= "1-Frame.png", nullable=False)
    hp = db.Column(db.Integer, default=100)

    def __repr__(self) -> str:
        return f"<User(name={self.username!r}), level={self.level!r}>"
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class UsersSchema(mm.SQLAlchemyAutoSchema):
    """User schema"""
    class Meta:
        model = Users
        include_relationship= True

class Tasks(db.Model):
    __tablename__ = "tasks"
    id= db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey("users.id"))
    title= db.Column(db.String, nullable=False)
    description= db.Column(db.String)
    difficulty= db.Column(db.Integer, default=1)
    # Give a default of 1. Difficulty range from 1-5 and the more difficult the task, more the coins given out
    # Need to implement logic while accumulating gold where it checks what difficulty the task is
    status= db.Column(db.Boolean, default=False)

    def __repr__(self) -> str:
        return f"<Task(name={self.title!r})>"

class TasksSchema(mm.SQLAlchemyAutoSchema):
    """Tasks schema"""
    class Meta:
        model = Tasks
        include_fk= True

class Habits(db.Model):
    __tablename__= "habits"
    id= db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey("users.id"))
    title= db.Column(db.String, nullable=False)
    good_or_bad= db.Column(db.String, default='good', nullable=False)
    streak= db.Column(db.Integer, default=0)

    def __repr__(self) -> str:
        return f"<Habit(habit={self.description!r})>"

class HabitsSchema(mm.SQLAlchemyAutoSchema):
    """Habits schema"""
    class Meta:
        model = Habits
        include_fk= True

class Rewards(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey("users.id"))
    title= db.Column(db.String, nullable=False)
    price= db.Column(db.Integer, nullable= False)

    def __repr__(self) -> str:
        return f"<Rewards(reward={self.title!r})>"

class RewardsSchema(mm.SQLAlchemyAutoSchema):
    """Rewards schema"""
    class Meta:
        model = Rewards
        include_fk= True


