import { useParams } from "react-router-dom";

const RecentPostView = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();

  return (
    <>
      <div className="">
        <h1>{slug}</h1>
        <p>{id}</p>
      </div>
    </>
  );
};

export default RecentPostView;