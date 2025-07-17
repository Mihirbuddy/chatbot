import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'

const UserAuth = ({ children }) => {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        // If no token, redirect
        if (!token) {
            navigate('/login');
            return;
        }

        // If user is already in context, no issue
        if (user) {
            setLoading(false);
            return;
        }

        // Else, fallback: try to get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setLoading(false); // User will already be loaded by context's useEffect
        } else {
            navigate('/login');
        }

    }, [user]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-white bg-black">Loading...</div>;
    }

    return <>{children}</>;
};

export default UserAuth;
