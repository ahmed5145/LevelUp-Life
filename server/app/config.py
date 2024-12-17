from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import dotenv
from flask import Flask
from flask_login import LoginManager
import pathlib


db= SQLAlchemy()
mm= Marshmallow()
login_manager= LoginManager()
login_manager.login_view= "auth.login"

def create_app():
    this_app = Flask(__name__)
    this_dir = pathlib.Path(__file__).parent.parent
    dotenv.load_dotenv(this_dir / pathlib.Path(".flaskenv"))
    this_app.config.from_prefixed_env()
    db_file = this_dir / pathlib.Path(
        f"{this_app.config['DATABASE_FILE']}.sqlite3"
    )
    this_app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file}"
    login_manager.init_app(this_app)
    db.init_app(this_app)
    if not db_file.exists():
        with this_app.app_context():
            db.create_all()
    with this_app.app_context():
        mm.init_app(this_app)
    return this_app