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
    register: async (userData) => {
        try {
            await register(userData)
            return { success: true, message: null }
        }
        catch (err) {
            const { message } = parseApiError(err, 'Registration Failed!')
            return { success: false, message }
        }
    },
    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const response = await login(email, password)
            set({ user: response?.data?.user, isAuthenticated: true })
            return { success: true, message: null }
        }
        catch (err) {
            const { message } = parseApiError(err, 'Login Failed!')
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