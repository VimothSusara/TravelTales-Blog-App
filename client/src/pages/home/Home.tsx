import { NavLink, Outlet } from "react-router-dom";

import { ClockFading, HeartPulse } from "lucide-react";

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
              `${
                isActive
                  ? "text-gray-800 font-semibold border-gray-900 border-b-2"
                  : "text-muted-foreground"
              } px-5 py-1 rounded-md flex justify-center items-center align-middle`
            }
          >
            <ClockFading size={17} className="mr-2" />
            Recent
          </NavLink>
          <NavLink
            to="popular"
            className={({ isActive }) =>
              `${
                isActive
                  ? "text-gray-800 font-semibold border-gray-900 border-b-2"
                  : "text-muted-foreground"
              } px-5 py-1 rounded-md flex justify-center items-center align-middle`
            }
          >
            <HeartPulse size={17} className="mr-2" />
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
