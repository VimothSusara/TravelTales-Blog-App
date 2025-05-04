import { Outlet } from "react-router-dom";

const BlogLayout = () => {
  return (
    <>
      <div className="h-[calc(100vh-4rem)] md:w-1/2 mx-auto px-2.5 flex flex-col gap-2 py-2">
        <Outlet />
      </div>
    </>
  );
};

export default BlogLayout;
