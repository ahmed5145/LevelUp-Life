import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export default function GetCharacter() {
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [avatars, setAvatars] = useState([]); 
  const path = "/assets/";

  useEffect(() => {
    fetchCurrentAvatar();
  }, []);

  const fetchCurrentAvatar = async () => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1"); 
    try {
      const response = await fetch("http://127.0.0.1:5000/api/avatar", {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch avatar");
      }
      const data = await response.json();
      setSelectedAvatar(data.avatar);
      // Make a list with all the possible images from the assets folder
      const avatarNumbers = Array.from({ length: 14 }, (_, i) => `${i + 1}p.png`);
      setAvatars(avatarNumbers);
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const handleAvatarSelect = async (newAvatar) => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/avatar/select", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ avatar: newAvatar }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }
      // When user selects an avatar, set it. 
      setSelectedAvatar(newAvatar);
      // Update other avatars list and include the previously selected back to the options
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <div>
      <h1>Profile</h1>

      {/* Currenty selected avatar */}
      <Card style={{ width: "17rem", margin: "0 auto", textAlign: "center" }}>
        <Card.Img variant="top" src={`${path}${selectedAvatar}`} />
        <Card.Body>
          <Button variant="primary">Selected Avatar</Button>
        </Card.Body>
      </Card>

      <h2>Choose Your Avatar</h2>

      {/* Show all the other options */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", justifyContent: "center", }}>
        {avatars.map((avatar, index) => (
          <Card key={index} style={{ width: "200px", textAlign: "center",
              border: avatar === selectedAvatar ? "2px solid #007bff" : "1px solid #ddd", }}>
            <Card.Img
              variant="top"
              src={`${path}${avatar}`}
              height="150px"/>
            <Card.Body>
              <Button variant="secondary"
              disabled={avatar=== selectedAvatar}
              onClick={() => handleAvatarSelect(avatar)}>Select</Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}
