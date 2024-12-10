def test_create_task(client, test_user, monkeypatch):
    """Test task creation endpoint"""
    def mock_get_jwt_identity(email='test_google_id'):
        return email
    
    monkeypatch.setattr('tasks_routes.get_jwt_identity', mock_get_jwt_identity)
    
    task_data = {
        'title': 'Test Task',
        'description': 'Test Description',
        'difficulty': 2
    }
    
    response = client.post('/api/tasks', json=task_data)
    
    assert response.status_code == 201
    assert response.json['title'] == 'Test Task'
    assert response.json['difficulty'] == 2

def test_update_task(client, test_user, monkeypatch):
    """Test task update endpoint"""
    def mock_get_jwt_identity(email='test_google_id'):
        return email
    
    monkeypatch.setattr('tasks_routes.get_jwt_identity', mock_get_jwt_identity)
    
    # First create a task
    task_data = {
        'title': 'Test Task',
        'description': 'Test Description',
        'difficulty': 2
    }
    
    create_response = client.post('/api/tasks', json=task_data)
    task_id = create_response.json['id']
    
    # Then update the task
    update_response = client.put(f'/api/tasks/{task_id}', json={'status': True})
    
    assert update_response.status_code == 200
    assert update_response.json['status'] is True
