import { useGetCurrentUser } from "@/lib/react-query/queries";

const PointsDisplay = () => {
  const { data: currentUser } = useGetCurrentUser();

  return (
    <div className="text-white bg-blue-500 px-3 py-1 rounded-full text-sm">
      Points: {currentUser?.pointsEarned || 0}
    </div>
  );
};

export default PointsDisplay;