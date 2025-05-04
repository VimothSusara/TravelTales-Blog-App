import { Outlet } from "react-router-dom";

//components
import MainPanel from "@/components/panels/MainPanel";

const MainLayout = () => {
  return (
    <>
      <div className="h-[calc(100vh-4rem)] md:w-4/5 mx-auto px-2.5 flex flex-col md:flex-row gap-2 py-2">
        <div className="w-full md:w-3/4 p-3 overflow-y-auto hide-scrollbar">
          <Outlet />
        </div>
        <div className="w-full md:w-1/4 p-3 hidden md:block overflow-y-auto hide-scrollbar">
          <MainPanel />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
