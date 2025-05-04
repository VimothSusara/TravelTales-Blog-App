import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

//pages
import Navbar from "@/components/Navbar";
import Home from "@/pages/home/Home";
import RecentPosts from "@/pages/home/RecentPosts";
import PopularPosts from "@/pages/home/PopularPosts";
import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";

//layouts
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import RecentPostView from "@/pages/home/RecentPostView";
import BlogLayout from "@/layouts/BlogLayout";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="/" element={<Home />}>
              <Route index element={<Navigate to="recent" replace />} />
              <Route path="recent" element={<RecentPosts />} />
              <Route path="popular" element={<PopularPosts />} />
            </Route>
          </Route>
          <Route path="/blog/" element={<BlogLayout />}>
            <Route path=":slug/:id" element={<RecentPostView />} />
          </Route>
          <Route path="/auth/" element={<AuthLayout />}>
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
