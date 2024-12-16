import React, { useEffect, useState } from "react";
import { getRpgStatus } from "../api/rpgApi";
import ProgressBar from 'react-bootstrap/ProgressBar'

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
            <div>
                <p>HP: </p>
                <ProgressBar variant='danger' now= {status.hp} />
            </div>
        </div>
    );
};

export default Status;
