import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useStatus } from "./components/StatusContext";

async function getUserInfo(responseCode, fetchStatus) {
  try {
    const response = await fetch("https://levelup-life-3.onrender.com/google/login", {
      method: "POST",
      credentials: "include",
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

    const userInfo = await response.json();
    // Call fetchstatus after you get user info
    await fetchStatus();

    return userInfo;
  } catch (error) {
    console.error("Error fetching user info: ", error);
    return null;
  }
}

export default function GoogleLogin({ onLoginSuccess }) {
  const { fetchStatus } = useStatus();
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (responseCode) => {
      const loginDetails = await getUserInfo(responseCode, fetchStatus);
      if (loginDetails) {
        onLoginSuccess(loginDetails.user);
      } else {
        console.error("Failed to retrieve user");
      }
    },
  });

  return <button onClick={googleLogin}>Google Login</button>;
}
