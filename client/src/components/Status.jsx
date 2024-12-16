import React, { useEffect, useState } from "react";

const BASE_URL = "http://127.0.0.1:5000/api/rpg";

const Status = () => {
  const [status, setStatus] = useState({ level: 1, xp: 0, coins: 0, hp: 100 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Extract cookies for JWT and CSRF
        const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        // Make the GET request to the status endpoint
        const response = await fetch(`${BASE_URL}/status`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`, // JWT token
            "X-CSRF-TOKEN": csrfToken,         // CSRF token
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch status");
        }

        const data = await response.json();
        setStatus(data); // Update status state
        setError(null); // Clear any existing errors
      } catch (error) {
        console.error("Error fetching status:", error);
        setError("Failed to fetch status. Please try again.");
      }
    };

    fetchStatus(); // Call the fetch function on component mount
  }, []);

  return (
    <div className="status-container">
      <h3>RPG Status</h3>
      {error && <p className="text-red-500">{error}</p>}
      <p>Level: {status.level}</p>
      <p>XP: {status.xp}</p>
      <p>Gold Coins: {status.coins}</p>
      <p>HP: {status.hp}</p>
    </div>
  );
};

export default Status;
