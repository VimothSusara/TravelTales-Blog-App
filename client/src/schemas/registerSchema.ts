import * as yup from "yup";

export const registerSchema = yup.object({
    username: yup.string().required("Username is required"),
    first_name: yup
        .string()
        .required('First Name is required')
        .min(5, 'First Name must be at least 5 characters'),
    last_name: yup.string().required("Last Name is required"),
    phone_number: yup
        .string()
        .required('Phone Number is required'),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters'),
    rePassword: yup
        .string()
        .required('Password confirmation required')
        .oneOf([yup.ref('password')], 'Password must match'),
    avatar: yup
        .mixed()
        .test('fileSize', 'Image must be less than 5MB', function (value) {
            if (!value || !(value instanceof File)) return true;
            return value.size <= 5 * 1024 * 1024;
        })
        .test('fileType', 'Please select an image file', function (value) {
            if (!value || !(value instanceof File)) return true;
            return value.type.startsWith('image/');
        }).required("Avatar is required"),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;