import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

//pages
const Navbar = lazy(() => import("@/components/Navbar"));
const Home = lazy(() => import("@/pages/home/Home"));
const RecentPosts = lazy(() => import("@/pages/home/RecentPosts"));
const PopularPosts = lazy(() => import("@/pages/home/PopularPosts"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Login = lazy(() => import("@/pages/auth/Login"));
const CreatePost = lazy(() => import("@/pages/home/CreatePost"));
const EditPost = lazy(() => import("@/pages/home/EditPost"));
const SearchPosts = lazy(() => import("@/pages/home/SearchPosts"));
const Profile = lazy(() => import("@/pages/home/Profile"));

//layouts
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import PostView from "@/pages/home/PostView";
import BlogLayout from "@/layouts/BlogLayout";

//wrappers
import ProtectedRoute from "@/components/protectedWrappers/ProtectedRoute";
import AuthRoute from "@/components/protectedWrappers/AuthRoute";

//store
import useAuthStore from "@/store/authStore";

import { LoadingScreen } from "@/components/common/LoadingScreen";

const RouteWithSuspense = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (e) {
        console.log(e);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  if (isLoading) {
    //TODO: add loading screen
    return <LoadingScreen />;
  }

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route path="/" element={<Home />}>
                <Route index element={<Navigate to="recent" replace />} />
                <Route path="recent" element={<RecentPosts />} />
                <Route path="popular" element={<PopularPosts />} />
              </Route>
              <Route path="search" element={<SearchPosts />} />
            </Route>
            <Route path="/profile/" element={<BlogLayout />}>
              <Route path=":username" element={<Profile />} />
              <Route index element={<Navigate to="/" replace />}></Route>
            </Route>
            <Route path="/blog/" element={<BlogLayout />}>
              <Route path=":username/:slug/:id" element={<PostView />} />
              <Route
                path="create"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/auth/" element={<AuthLayout />}>
              <Route
                path="register"
                element={
                  <AuthRoute>
                    <Register />
                  </AuthRoute>
                }
              />
              <Route
                path="login"
                element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </Suspense>
    </>
  );
}

export default App;
