def test_google_login(client):
    """Test Google login endpoint"""
    # Mock Google OAuth response
    mock_oauth_response = {
        'code': 'test_auth_code',
        'client_id': 'test_client_id',
        'client_secret': 'test_client_secret'
    }
    
    response = client.post('/google/login', json=mock_oauth_response)
    assert response.status_code == 200
    assert 'access_token_cookie' in response.headers
    assert 'user' in response.json