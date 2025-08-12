// src/components/RegisterPage.tsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { loginSchema, LoginFormData } from "@/schemas/loginSchema";

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

const Login = () => {
  const navigate = useNavigate();
  const { login: loginUser, isLoading, error, user } = useAuthStore();

  const [loginLoading, setLoginLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginLoading(true);
      const response = await loginUser(data.email, data.password);

      if (response.success) {
        toast.success("Login successful!");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50">
      <Card className="w-full md:w-3/4 mx-auto mt-10">
        <CardHeader>  
          <CardTitle className="text-2xl font-bold">Log In</CardTitle>
          <CardDescription>Sign In to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {error && (
              <Alert variant="destructive" className="bg-red-100">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
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

export default Login;
