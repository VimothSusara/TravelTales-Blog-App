import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "@/store/authStore";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // await login("admin@gmal.com", "admin12345");
    navigate("/auth/login");
  };

  const handleRegister = async () => {
    navigate("/auth/register");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between container mx-auto px-2.5">
          <a href="#" className="text-lg font-semibold">
            Travel Tales
          </a>
          <nav className="flex gap-6">
            <NavLink to={"/"} className="hover:text-blue-700 flex items-center">
              <Home className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Home</span>
            </NavLink>
            <a href="#" className="hover:text-blue-700 flex items-center">
              <Search className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Search</span>
            </a>
            {isAuthenticated && (
              <a href="#" className="hover:text-blue-700 flex items-center">
                <SquarePen className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Write</span>
              </a>
            )}
            {isAuthenticated ? (
              <>
                <Avatar size="lg">
                  <AvatarImage src="/user.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>

                <div className="">
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button
                  className="hidden md:block cursor-pointer"
                  variant="outline"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;
