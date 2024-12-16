import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export default function GetCharacter() {
  const [selectedAvatar, setSelectedAvatar] = useState(""); // Avatar stored in DB
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState(""); // Local selection
  const [avatars, setAvatars] = useState([]); // All available avatars
  const path = "/assets/character/";

  // Fetch the current avatar on initial load
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
      setTempSelectedAvatar(data.avatar);
      const avatarNumbers = Array.from({ length: 14 }, (_, i) => `${i + 1}p.png`);
      setAvatars(avatarNumbers); 
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  //Local state avatar selection
  const handleAvatarSelect = (newAvatar) => {
    setTempSelectedAvatar(newAvatar);
  };

  // When user saves -> save the local state to the database
  const saveCharacter = async () => {
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
        body: JSON.stringify({ avatar: tempSelectedAvatar }),
      });

      if (!response.ok) {
        throw new Error("Failed to save avatar");
      }

      setSelectedAvatar(tempSelectedAvatar);
      updateNavbarAvatar(tempSelectedAvatar);
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  // Update the image in the nav bar
  const updateNavbarAvatar = (avatar) => {
    const navAvatarElement = document.querySelector("#nav-avatar");
    if (navAvatarElement) {
      navAvatarElement.src = `${path}${avatar}`;
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      <Button variant="success" onClick={saveCharacter} disabled={tempSelectedAvatar === selectedAvatar}>
        Save
      </Button>

      <Card style={{ width: "17rem", margin: "0 auto", textAlign: "center" }}>
        <Card.Img variant="top" src={`${path}${tempSelectedAvatar}`} />
        <Card.Body>
          <Button variant="primary">Selected Avatar</Button>
        </Card.Body>
      </Card>

      <h2>Choose Your Avatar</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        {avatars.map((avatar, index) => (
          <Card
            key={index}
            style={{
              width: "200px",
              textAlign: "center",
              border: avatar === tempSelectedAvatar ? "2px solid #007bff" : "1px solid #ddd",
            }}
          >
            <Card.Img
              variant="top"
              src={`${path}${avatar}`}
              height="150px"
            />
            <Card.Body>
              <Button
                variant="secondary"
                disabled={avatar === tempSelectedAvatar}
                onClick={() => handleAvatarSelect(avatar)}
              >
                Select
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}
