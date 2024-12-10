import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

async function getUserInfo(responseCode) {
  try {
    const response = await fetch("http://127.0.0.1:5000/google/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: responseCode.code }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error response from backend:", error);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user info: ", error);
    return null;
  }
}

export default function GoogleLogin({ onLoginSuccess }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (responseCode) => {
      const loginDetails = await getUserInfo(responseCode);
      if (loginDetails) {
        setLoggedIn(true);
        setUser(loginDetails.user);
        onLoginSuccess();
      }
    },
  });

  const handleLogout = () => {
    setLoggedIn(false);
    setUser({});
    // Optional: We can clear the access token cookie here
  };


  return (
    <>
      {!loggedIn ? (
        <button onClick={googleLogin}>Google Login</button>
      ) : (
        <div>
          <p>Hello, {user.given_name || "User"}!</p>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}

    </>
  );
}