import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_SERVER_HOST;

export const register = async (formData: FormData) => {
    console.log(formData);
    return await axios.post(
        `${API_BASE_URL}api/auth/register`,
        formData,
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