import { Models } from "appwrite";
import { Loader, PostCard } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import PointsDisplay from "@/components/shared/PointsDisplay";

const Home = () => {
  const navigate = useNavigate();
  const {
    data: currentUser,
    isLoading: userLoading,
    isError: isUserError,
  } = useGetCurrentUser();

  let userMemberGroups = currentUser?.UserMember
    ? [...currentUser.UserMember].reverse()
    : [];

  if (isUserError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-light-1 text-2xl">Something went wrong</p>
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container max-w-4xl mx-auto">
        <div className="text-center mt-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2 animate-fade-in">
            Welcome to Splitify
          </h1>
          <p className="text-light-2 text-lg animate-slide-up">
            Simplify your shared expenses
          </p>
        </div>

        <PointsDisplay />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-bold">Your Groups</h2>
            <button
              className="bg-primary-500 text-white px-4 py-2 rounded-full 
                         hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 
                         transition duration-300 ease-in-out"
              onClick={() => navigate("/create-group")}
            >
              Add Group
            </button>
          </div>

          {userLoading ? (
            <Loader />
          ) : userMemberGroups.length === 0 ? (
            <p className="text-light-2 text-center text-lg">
              You are not part of any groups yet.
            </p>
          ) : (
            <div className="max-h-[460px] overflow-y-auto custom-scrollbar">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMemberGroups.map((group: Models.Document) => (
                  <li
                    key={group.$id}
                    className="bg-dark-3 p-4 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg"
                  >
                    <PostCard post={group} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
