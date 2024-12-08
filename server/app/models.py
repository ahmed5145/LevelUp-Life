from config import db, mm
from flask_login import UserMixin

class Users(UserMixin, db.Model):
    __tablename__ = "users"
    id= db.Column(db.Integer, primary_key=True, autoincrement=True)
    google_id= db.Column(db.String, unique=True, nullable=False)
    username= db.Column(db.String, nullable=False) # Can be the user's name from Google. Can change if needed
    """
    password= db.Column(db.String, nullable=False) 
    # Optional if decidce to use JWT/ other login. Google Login doesn't requrie storing a password
    """
    level= db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    coins = db.Column(db.Integer, default=0)

    def __repr__(self) -> str:
        return f"<User(name={self.username!r}), level={self.level!r}>"
    
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
    description= db.Column(db.String)
    good_or_bad= db.Column(db.Boolean, default=True)
    streak= db.Column(db.Integer, default=0)

    def __repr__(self) -> str:
        return f"<Habit(habit={self.description!r})>"

class HabitsSchema(mm.SQLAlchemyAutoSchema):
    """Habits schema"""
    class Meta:
        model = Habits
        include_fk= True

# A Daily is a task that you set to be done daily/ reoccuring task
class Dailies(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey("users.id"))
    title= db.Column(db.String, nullable=False)
    description= db.Column(db.String)
    difficulty= db.Column(db.Integer, default=1)
    streak= db.Column(db.Integer, default=0)

    def __repr__(self) -> str:
        return f"<Daily(task={self.title!r})>"

class DailiesSchema(mm.SQLAlchemyAutoSchema):
    """Dailies schema"""
    class Meta:
        model = Dailies
        include_fk= True


