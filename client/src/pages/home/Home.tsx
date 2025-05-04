import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

//hooks
// import useScrollRestore from "@/hooks/useScrollRestore";

const Home = () => {
  // useScrollRestore(".scrollable-container");

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-center gap-2 mb-2 sticky top-0 bg-background z-10 pt-2 pb-2">
          <NavLink
            to="recent"
            className={({ isActive }) =>
              isActive ? "text-blue-400 font-normal" : "text-muted-foreground"
            }
          >
            Recent
          </NavLink>
          <NavLink
            to="popular"
            className={({ isActive }) =>
              isActive ? "text-blue-400 font-normal" : "text-muted-foreground"
            }
          >
            Popular
          </NavLink>
        </div>
        <div className="w-full h-full overflow-y-auto hide-scrollbar scrollable-container">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Home;
