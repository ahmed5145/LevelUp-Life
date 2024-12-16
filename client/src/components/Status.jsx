import React, { useEffect, useState } from "react";
import { getRpgStatus } from "../api/rpgApi";

const Status = () => {
    const [status, setStatus] = useState({ level: 1, xp: 0, coins: 0, hp: 100 });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await getRpgStatus();
                setStatus(data);
            } catch (error) {
                console.error("Error fetching status:", error);
            }
        };
        fetchStatus();
    }, []);

    return (
        <div className="status-container">
            <h3>RPG Status</h3>
            <p>Level: {status.level}</p>
            <p>XP: {status.xp}</p>
            <p>Gold Coins: {status.coins}</p>
            <p>HP: {status.hp}</p>
        </div>
    );
};

export default Status;
