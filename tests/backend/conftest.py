import pytest
from app import create_app, db
from app.models import Users, Tasks

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(app):
    user = Users(
        google_id='test_google_id', 
        username='TestUser', 
        level=1, 
        xp=0, 
        coins=0
    )
    db.session.add(user)
    db.session.commit()
    return user