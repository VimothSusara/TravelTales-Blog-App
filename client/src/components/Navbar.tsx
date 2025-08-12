import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  SquarePen,
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getImageUrl } from "@/utils/imageLink";

import useAuthStore from "@/store/authStore";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
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
    navigate("/");
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
            <NavLink to={"/search"} className="hover:text-blue-700 flex items-center">
              <Search className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Search</span>
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to={"/blog/create"}
                className="hover:text-blue-700 flex items-center"
              >
                <SquarePen className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Write</span>
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar size="md" className="cursor-pointer">
                      <AvatarImage src={getImageUrl(user?.avatar_url || "")} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <NavLink to={`/profile/${user?.username}`}>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </NavLink>
                      <DropdownMenuItem>
                        <SquarePen className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <NavLink to={""} onClick={handleLogout}>
                        <DropdownMenuItem>
                          <LogOutIcon className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </NavLink>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
