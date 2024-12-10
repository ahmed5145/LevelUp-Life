def test_user_model(app):
    """Test User model creation"""
    user = Users(
        google_id='test_id', 
        username='TestUser', 
        level=1, 
        xp=0, 
        coins=0
    )
    
    db.session.add(user)
    db.session.commit()
    
    assert user.username == 'TestUser'
    assert user.level == 1
    assert user.xp == 0
    assert user.coins == 0

def test_task_model(app, test_user):
    """Test Task model creation"""
    task = Tasks(
        user_id=test_user.id, 
        title='Test Task', 
        description='Test Description',
        difficulty=3
    )
    
    db.session.add(task)
    db.session.commit()
    
    assert task.title == 'Test Task'
    assert task.description == 'Test Description'
    assert task.difficulty == 3
    assert task.status is False