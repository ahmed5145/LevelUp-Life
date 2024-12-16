import axios from "axios";

const BASE_URL = "http://localhost:5000/api/rpg";

export const getRpgStatus = async () => {
    const response = await axios.get(`${BASE_URL}/status`, { withCredentials: true });
    return response.data;
};

export const updateHabit = async (habitId, isGood) => {
    print("Received request data:", request.json)
    const response = await axios.post(`${BASE_URL}/update_habit`, {
        habit_id: habitId,
        is_good: isGood,
    }, { withCredentials: true });
    return response.data;
};
