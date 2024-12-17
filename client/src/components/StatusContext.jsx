    import React, { createContext, useContext, useState, useEffect } from "react";

    const StatusContext = createContext();

    export const StatusProvider = ({ children }) => {
    const [status, setStatus] = useState({ level: 1, xp: 0, coins: 0, hp: 100, frame: '1-Frame.png' });
    const [error, setError] = useState(null);

    const fetchStatus = async () => {
    try {
        const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        const response = await fetch("http://127.0.0.1:5000/api/rpg/status", {
        method: "GET",
        credentials: "include",
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-CSRF-TOKEN": csrfToken,
            "Content-Type": "application/json",
        },
        });

        if (!response.ok) {
        throw new Error("Failed to fetch status");
        }

        const data = await response.json();
        setStatus(data);
        setError(null);
    } catch (error) {
        console.error("Error fetching status:", error);
        setError("Failed to fetch status. Please try again.");
    }
    };

    const updateStatus= (newStatus) =>{
        setStatus((prevStatus) => ({
        ...prevStatus, ...newStatus
        }));
    }
    const resetStatus = () =>{
        setStatus({ level: 1, xp: 0, coins: 0, hp: 100, frame: '1-Frame.png' });
    };


    useEffect(() => {
    fetchStatus();
    }, []);


    return (
    <StatusContext.Provider value={{ status, setStatus, fetchStatus, updateStatus, resetStatus, error }}>
        {children}
    </StatusContext.Provider>
    );
    };

    export const useStatus = () => useContext(StatusContext);
