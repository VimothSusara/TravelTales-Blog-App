import { create } from "zustand";

//types
import { AuthState } from "@/types/auth";

//services
import { register, login, logout, checkAuth } from "@/services/authService";

//helper function for error handling
import { parseApiError } from "@/utils/parseError";

const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    register: async (formData: FormData) => {
        try {
            const response = await register(formData)
            if (response.data.success) {
                return { success: true, message: response.data.message || 'Registration successful. Please login.' }
            }
            else {
                return { success: false, message: response.data.message || 'Registration Failed!' }
            }
        }
        catch (err) {
            const { message } = parseApiError(err, 'Registration Failed!')
            set({ error: message })
            return { success: false, message }
        }
    },
    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const response = await login(email, password)

            if (!response.data.success) {
                return { success: false, message: response.data.message || 'Login Failed!' }
            }
            set({ user: response?.data?.user, isAuthenticated: true })
            return { success: true, message: "Login successful" }
        }
        catch (err) {
            const { message } = parseApiError(err, 'Login Failed!')
            set({ error: message })
            return { success: false, message }
        }
        finally {
            set({ isLoading: false })
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null })
        try {
            await logout()
            set({ user: null, isAuthenticated: false })
        }
        catch (err) {
            const { message } = parseApiError(err, 'Logout Failed!')
            console.log(message)
        }
        finally {
            set({ isLoading: false })
        }
    },
    checkAuth: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await checkAuth()
            set({ user: response?.data?.user, isAuthenticated: response?.data?.authenticated })
        }
        catch (err) {
            const { message } = parseApiError(err, 'Authentication Failed!')
            console.log(message)
        }
        finally {
            set({ isLoading: false })
        }
    },
}))

export default useAuthStore