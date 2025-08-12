import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;