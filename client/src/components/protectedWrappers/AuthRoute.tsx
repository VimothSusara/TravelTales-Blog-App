import { ReactNode } from "react";
import useAuthStore from "@/store/authStore";
import { Navigate, useLocation } from "react-router-dom";

interface AuthRouteProps {
  children: ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  return isAuthenticated ? (
    <Navigate to={location.state?.from?.pathname || "/"} replace />
  ) : (
    children
  );
};

export default AuthRoute;
