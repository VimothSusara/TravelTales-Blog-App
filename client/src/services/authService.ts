import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_SERVER_HOST;

//types
import { userData } from "@/types/auth";

export const register = async (userData: userData) => {
    return await axios.post(
        `${API_BASE_URL}api/auth/register`,
        {
            userData,
        },
        {
            withCredentials: true,
        }
    );
};

export const login = async (email: string, password: string) => {
    return await axios.post(
        `${API_BASE_URL}api/auth/login`,
        {
            email,
            password,
        },
        {
            withCredentials: true,
        }
    );
};

export const checkAuth = async () => {
    return await axios.get(`${API_BASE_URL}api/auth/checkAuth`, {
        withCredentials: true,
    })
}

export const logout = async () => {
    return await axios.get(`${API_BASE_URL}api/auth/logout`, {
        withCredentials: true
    })
}