import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from "react-bootstrap";
import { useStatus } from './StatusContext';
import { toast } from 'react-toastify';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', difficulty: 1 });
  const [error, setError] = useState(null);
  const {updateStatus} = useStatus();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch('http://127.0.0.1:5000/api/tasks', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch('http://127.0.0.1:5000/api/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      setTasks([data, ...tasks]);
      setNewTask({ title: '', description: '', difficulty: 1 });
      setError(null);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    }
  };
  
  
  const handleCompleteTask = async (taskId, difficulty) => {
    try {
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      const response = await fetch(`http://127.0.0.1:5000/api/rpg/update_task`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-CSRF-TOKEN": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_id: taskId, difficulty: difficulty }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete task");
      }
      const result= await response.json();
      updateStatus({
        xp: result.xp,
        hp: result.hp,
        coins: result.coins,
        level: result.level,
        frame: result.frame,
      });

      toast.success(`Task completed! xp: ${result.xp}, hp: ${result.hp}`, {
        position: "top-right",
        autoClose: 5000, 
        hideProgressBar: true,
        closeOnClick: true, 
        pauseOnHover: true,
        draggable: false,
      });
      
      fetchTasks(); // Refresh tasks after completion
    } catch (error) {
      console.error("Error completing task:", error);
      setError("Failed to complete task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          "X-CSRF-TOKEN": csrfToken,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="task-manager p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Task Creation Form */}
      <form onSubmit={handleCreateTask} className="mb-6 bg-white p-4 rounded shadow">
        <input 
          type="text" 
          placeholder="Task Title" 
          value={newTask.title}
          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          required 
          className="w-full p-2 border rounded mb-2"
        />
        <textarea 
          placeholder="Description (optional)"
          value={newTask.description}
          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          className="w-full p-2 border rounded mb-2"
        />
        <select 
          value={newTask.difficulty}
          onChange={(e) => setNewTask({...newTask, difficulty: parseInt(e.target.value)})}
          className="w-full p-2 border rounded mb-2"
        >
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
          <option value={4}>Very Hard</option>
          <option value={5}>Extreme</option>
        </select>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Task
        </button>
      </form>

      {/* Task List */}
      <div className="task-list space-y-4">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`task bg-white p-4 my-2 rounded shadow ${task.status ? 'opacity-50' : ''}`}
          >
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600 mb-2">{task.description}</p>
            <p className="text-sm mb-2">Difficulty: {task.difficulty}</p>
            <div className="task-actions flex space-x-2">
              <button 
                onClick={() => handleCompleteTask(task.id, task.difficulty)}
                className="flex-1 p-2 bg-blue-500 text-white rounded"
              >
                Complete
              </button>
              <button 
                onClick={() => handleDeleteTask(task.id)}
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

export default TaskManager;
