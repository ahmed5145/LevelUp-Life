import pytest
from flask import url_for
from app.config import create_app, db
from app.models import Users, Tasks

def test_main_route(client):
    """Test the main route is accessible"""
    response = client.get('/')
    assert response.status_code == 200

def test_unauthorized_routes(client):
    """Test routes that require authentication"""
    # Test tasks routes without authentication
    routes_to_test = [
        ('/api/tasks', 'GET'),
        ('/api/tasks', 'POST'),
        ('/api/tasks/1', 'PUT'),
        ('/api/tasks/1', 'DELETE')
    ]
    
    for route, method in routes_to_test:
        response = None
        if method == 'GET':
            response = client.get(route)
        elif method == 'POST':
            response = client.post(route)
        elif method == 'PUT':
            response = client.put(route)
        elif method == 'DELETE':
            response = client.delete(route)
        
        # Expect unauthorized status
        assert response.status_code == 401, f"Route {route} with method {method} should be unauthorized"

def test_api_versioning(client):
    """Verify API versioning and route structure"""
    assert '/api/tasks' in str(client.get('/api/tasks')), "Tasks API route should exist"
    assert '/google/login' in str(client.post('/google/login', json={})), "Google login route should exist"