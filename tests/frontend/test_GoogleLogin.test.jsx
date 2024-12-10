import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLogin from '../../src/components/GoogleLogin';

// Mock the useGoogleLogin hook
jest.mock('@react-oauth/google', () => ({
  ...jest.requireActual('@react-oauth/google'),
  useGoogleLogin: () => ({
    flow: 'auth-code',
    onSuccess: jest.fn()
  })
}));

describe('GoogleLogin Component', () => {
  test('renders login button when not logged in', () => {
    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <GoogleLogin onLoginSuccess={jest.fn()} />
      </GoogleOAuthProvider>
    );
    
    expect(screen.getByText('Google Login')).toBeInTheDocument();
  });

  test('calls onLoginSuccess when login is successful', async () => {
    const mockLoginSuccess = jest.fn();
    
    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <GoogleLogin onLoginSuccess={mockLoginSuccess} />
      </GoogleOAuthProvider>
    );
    
    // Simulate login button click
    fireEvent.click(screen.getByText('Google Login'));
    
    // Verify onLoginSuccess is called
    await waitFor(() => {
      expect(mockLoginSuccess).toHaveBeenCalled();
    });
  });
});