import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_REST_COUNTRIES_HOST;

export const getCountries = async () => {
    return await axios.get(`${API_BASE_URL}/all`)
}

export const getCountry = async (name: string) => {
    return await axios.get(`${API_BASE_URL}/name/${name}`)
}