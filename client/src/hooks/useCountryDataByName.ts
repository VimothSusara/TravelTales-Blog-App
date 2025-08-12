import { useEffect, useState } from "react";
import { getCountry } from "@/services/countriesService";

import { Country } from "@/types/country";

const useCountryDataByName = (countryName: string | undefined) => {
    const [country, setCountry] = useState<Country | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);

        if (!countryName) return;

        const fetchCountry = async () => {
            try {
                const response = await getCountry(countryName);
                console.log(response.data[0]);
                setCountry(response.data[0]);
            } catch (error) {
                setError("Failed to fetch post. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCountry();
    }, [countryName])

    return { country, loading, error }
}

export default useCountryDataByName