import React, { useState, useEffect } from "react";
import { useStatus } from "./StatusContext"; // Import StatusContext
import { toast } from "react-toastify";

const RewardsManager = () => {
  const { status, setStatus, error, setError, fetchStatus } = useStatus(); // Use status and fetchStatus from context
  const [newReward, setNewReward] = useState({ title: "", price: 0 }); // Reward form state
  const [rewards, setRewards] = useState([]); // List of rewards

  useEffect(() => {
    fetchRewards(); // Fetch rewards on component mount
  }, []);

  const fetchRewards = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch("http://127.0.0.1:5000/api/rewards", {
        method: "GET",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch rewards");

      const data = await response.json();
      setRewards(data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setError("Failed to fetch rewards.");
    }
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch("http://127.0.0.1:5000/api/rewards", {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(newReward),
      });

      if (!response.ok) throw new Error("Failed to create reward");

      const data = await response.json();
      setRewards([...rewards, data]);
      setNewReward({ title: "", price: 0 });
    } catch (error) {
      console.error("Error creating reward:", error);
      setError("Failed to create reward.");
    }
  };

  const handleBuyReward = async (rewardId, price) => {
    if (status.coins < price) {
      toast.warning(`Not enough coins`, {
        position: "top-left",
        autoClose: 5000, 
        hideProgressBar: true,
        closeOnClick: true, 
        draggable: false,
        theme: 'colored',
      });
      return;
    }

    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://127.0.0.1:5000/api/rewards/${rewardId}/buy`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) throw new Error("Failed to buy reward");

      const data = await response.json();
      setStatus({ ...status, coins: data.coins }); // Update coins in StatusContext
      toast.success(`Reward purchased`, {
        position: "top-left",
        autoClose: 5000, 
        hideProgressBar: true,
        closeOnClick: true, 
        draggable: false,
        theme: 'colored',
      });
      
    } catch (error) {
      console.error("Error buying reward:", error);
      setError("Failed to purchase reward.");
    }
  };

  const handleDeleteReward = async (rewardId) => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://127.0.0.1:5000/api/rewards/${rewardId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) throw new Error("Failed to delete reward");

      setRewards(rewards.filter((reward) => reward.id !== rewardId));
    } catch (error) {
      console.error("Error deleting reward:", error);
      setError("Failed to delete reward.");
    }
  };

  return (
    <div className="rewards-manager p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">My Rewards</h2>
      <p>Gold <img src="/assets/coin/coin 2.png" height="30px" width="30px"></img> {status.coins}</p>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
      )}

      {/* Create Reward Form */}
      <form onSubmit={handleCreateReward} className="mb-6 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Reward Title"
          value={newReward.title}
          onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
          required
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={newReward.price}
          onChange={(e) => setNewReward({ ...newReward, price: parseInt(e.target.value) })}
          required
          className="w-full p-2 border rounded mb-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Reward
        </button>
      </form>

      {/* Reward List */}
      <div className="reward-list space-y-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="reward bg-white p-4 my-2 rounded shadow">
            <h3 className="text-lg font-semibold">{reward.title}</h3>
            <p className="text-gray-600 mb-2">Price: {reward.price} coins</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBuyReward(reward.id, reward.price)}
                className="flex-1 p-2 bg-green-500 text-white rounded"
              >
                Buy
              </button>
              <button
                onClick={() => handleDeleteReward(reward.id)}
                className="flex-1 p-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsManager;
