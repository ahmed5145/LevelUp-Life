import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useStatus } from "./StatusContext";

const Status = () => {
  const { status, error } = useStatus();
  const XP_PER_LEVEL_BASE = 100;

  return (
    <div className="status-container">
      <h3>RPG Status</h3>
      {error && <p className="text-red-500">{error}</p>}
      <p>Level: {status.level}</p>
        
        <p>Gold <img src="/assets/coin/coin 2.png" height="30px" width="30px"></img> {status.coins}</p>

      <ProgressBar now={status.hp} label={`${status.hp} HP`} variant="danger"/>
      <ProgressBar now={status.xp} label={`${status.xp} XP`} />
    </div>
  );
};

export default Status;
