// src/components/RegisterPage.tsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { registerSchema, RegisterFormData } from "@/schemas/registerSchema";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { Flip, toast, ToastContainer } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, user } = useAuthStore();

  const [registerLoading, setRegisterLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  // Watch the avatar field to create preview
  const avatarFile = watch("avatar");

  // Create avatar preview when file changes
  useEffect(() => {
    if (avatarFile instanceof File) {
      if (!avatarFile.type.startsWith("image/")) {
        setError("avatar", { message: "Please select an image file" });
        return;
      }

      if (avatarFile.size > 5 * 1024 * 1024) {
        setError("avatar", { message: "Image must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(avatarFile);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarFile, setError]);

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterLoading(true);

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name || "");
    formData.append("phone_number", data.phone_number);
    formData.append("email", data.email);
    formData.append("password", data.password);

    if (data.avatar && data.avatar instanceof FileList && data.avatar[0]) {
      formData.append("avatar", data.avatar[0]);
    }
    const response = await registerUser(formData);

    if (response.success) {
      console.log("Registration successful. Please login.");
      toast.success("Registration successful. Please login.");
      navigate("/auth/login");
    } else {
      console.log("Register failed!", response.message);
    }
    setRegisterLoading(false);
  };

  return (
    <div className="w-full bg-gray-50">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="johndoe"
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="flex lg:flex-row flex-col gap-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  placeholder="First Name"
                  className={errors.first_name ? "border-red-500" : ""}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  placeholder="Last Name"
                  className={errors.last_name ? "border-red-500" : ""}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex lg:flex-row flex-col gap-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  {...register("phone_number")}
                  placeholder="Phone Number"
                  className={errors.phone_number ? "border-red-500" : ""}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex lg:flex-row flex-col gap-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rePassword">Confirm Password</Label>
                <Input
                  id="rePassword"
                  type="password"
                  {...register("rePassword")}
                  className={errors.rePassword ? "border-red-500" : ""}
                />
                {errors.rePassword && (
                  <p className="text-sm text-red-500">
                    {errors.rePassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {avatarPreview ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <Controller
                    name="avatar"
                    control={control}
                    defaultValue={undefined}
                    render={({ field }) => (
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                        }}
                        className={errors.avatar ? "border-red-500" : ""}
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF (max. 5MB)
                  </p>
                  {errors.avatar && (
                    <p className="text-sm text-red-500">
                      {errors.avatar.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={registerLoading}>
              {registerLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <NavLink to="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </NavLink>
          </p>
        </CardFooter>
      </Card>
      <ToastContainer
        position="top-center"
        autoClose={1200}
        hideProgressBar={true}
        closeOnClick={false}
        theme="dark"
        transition={Flip}
      />
    </div>
  );
};

export default Register;
