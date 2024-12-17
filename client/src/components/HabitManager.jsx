import React, { useState, useEffect } from 'react';

const HabitManager = () => {
  const [habits, setHabits] = useState([]); // Initialize as empty array
  const [highlightedHabit, setHighlightedHabit] = useState({});
  const [newHabit, setNewHabit] = useState({ title: '', good_or_bad: 'good' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch('http://127.0.0.1:5000/api/habits', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
  
      const data = await response.json();
  
      // Normalize good_or_bad to boolean
      setHabits(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('Failed to fetch habits. Please try again.');
    }
  };

  const handleCreateHabits = async (e) => {
    e.preventDefault();
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch('http://127.0.0.1:5000/api/habits', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(newHabit),
      });

      if (!response.ok) {
        throw new Error('Failed to create habit');
      }

      const data = await response.json();

      // Assuming the response is a single habit object, add it to the top of the list
      setHabits([...habits,data ]);
      setNewHabit({ title: '', good_or_bad: 'good' });
      setError(null);
    } catch (error) {
      console.error('Error creating habits:', error);
      setError('Failed to create habit. Please try again.');
    }
  };

  const handleDeleteHabits = async (habitId) => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://127.0.0.1:5000/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }

      setHabits(habits.filter((habit) => habit.id !== habitId));
      setError(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const handleHabitCompletion = async (habitId, good_or_bad) => {
    try {
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      const response = await fetch(`http://127.0.0.1:5000/api/rpg/update_habit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ habit_id: habitId, good_or_bad: good_or_bad }),
      });

      if (!response.ok) {
        throw new Error('Failed to update habit');
      }

      const result = await response.json();
      alert(
        `Habit updated! XP: ${result.xp}, Coins: ${result.coins}, HP: ${result.hp}, Streak: ${result.streak}`
      );

      // Highlight the habit
      setHighlightedHabit({ ...highlightedHabit, [habitId]: good_or_bad ? 'good' : 'bad' });

      fetchHabits(); // Refresh habits after update
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit. Please try again.');
    }
  };

  return (
    <div className="habit-manager p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">My Habits</h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Habit Creation Form */}
      <form onSubmit={handleCreateHabits} className="mb-6 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Habit Title"
          value={newHabit.title}
          onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
          required
          className="w-full p-2 border rounded mb-2"
        />
        <select
          value={newHabit.good_or_bad.toString()}
          onChange={(e) => setNewHabit({ ...newHabit, good_or_bad: e.target.value})}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="good">Good</option>
          <option value="bad">Bad</option>
        </select>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Create Habit
        </button>
      </form>

      {/* Habit List */}
      <div className="habit-list space-y-4">
        {habits.length > 0 &&
          habits.map((habit) => (
            <div
              key={habit.id}
              className={`habit bg-white p-4 rounded shadow ${habit.status ? 'opacity-50' : ''}`}
            >
              <h3 className="text-lg font-semibold">{habit.title}</h3>
              <p className="text-sm mb-2">Nature: {habit.good_or_bad === 'good' ?'Good' : 'Bad'}</p>
              <p className="text-sm mb-2">Streak: {habit.streak}</p>
              <div className="habit-actions flex space-x-2">
                <button
                  onClick={() => handleHabitCompletion(habit.id, habit.good_or_bad ==='good' ? 'good': 'bad')}
                  className="flex-1 p-2 bg-green-500 text-white rounded"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleDeleteHabits(habit.id)}
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

export default HabitManager;
