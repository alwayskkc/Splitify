import {
  useGetCurrentUser,
  useSignOutAccount,
  useUpdateUser
} from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import Profilephoto from "@/components/shared/Profilephoto";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { currencies } from "@/constants";

const Profile = () => {
  const { mutate: signOut } = useSignOutAccount();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUserContext();
  const { data: currentUser } = useGetCurrentUser();

  const [isDebtNotificationEnabled, setIsDebtNotificationEnabled] = useState(false);
  const [debtThreshold, setDebtThreshold] = useState(50);
  const [maxDebtThreshold] = useState(500);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(debtThreshold);
  const [] = useState(maxDebtThreshold);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const [pointsEarned, setPointsEarned] = useState(0);
  useUpdateUser();

  useEffect(() => {
    if (currentUser) {
      setPointsEarned(currentUser.pointsEarned || 0);
    }
  }, [currentUser]);

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser({ ...INITIAL_USER, pointsEarned: 0 });
    navigate("/sign-in");
  };



  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="common-container">
      <div className="user-container">
        <div className="container p-5">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>
          <section className="text-white bg-slate-800 p-4 shadow-md rounded-md">
            <h3 className="text-xl font-bold mb-4">Account</h3>

            <div
              style={{ display: "flex", alignItems: "center" }}
              className="pb-3 text-white">
              <Profilephoto name={currentUser} />
              <span className="text-lg font-bold mb-1 pl-3 text-blue-500 capitalize">
                {currentUser.name}{" "}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-gray-200">User Name:</span>
              <span className="font-semibold">@{currentUser.UserName}</span>
            </div>
            <div className="mb-4">
              <span className="text-gray-200">Email:</span>
              <span className="text-white font-semibold">
                {currentUser.email}
              </span>
            </div>
            <button className="bg-blue-500 font-semibold text-white px-4 py-2 rounded-md mr-2">
              Edit
            </button>
            <button className="bg-green-500 font-semibold text-white px-4 py-2 rounded-md">
              Contact
            </button>

            <div className="flex items-center">
            <p><strong>Points Earned:</strong> {pointsEarned || 0}</p>
            {(pointsEarned || 0) < 100 && (
              <span className="ml-2 text-sm text-yellow-500">
                {"["} Free access to Premium features when you score 100 points or above. Keep earning points 🙌 {"]"}
              </span>
            )}
            {(pointsEarned || 0) >= 100 && (
              <span className="ml-2 text-sm text-green-500">
                Congratulations! You have access to Premium features
              </span>
            )}
          </div>
            {/* Debt Notification Toggle */}
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={isDebtNotificationEnabled}
                  onChange={(e) => setIsDebtNotificationEnabled(e.target.checked)}
                />
                <span className="ml-2 text-white">Enable Debt Notifications</span>
              </label>
            </div>

            {/* Debt Threshold Settings */}
            {isDebtNotificationEnabled && (
              <>
                <div className="mt-4 flex gap-4">
                  <label className="block mt-2">Debt Notification Threshold:</label>
                  <div className="flex items-center">
                    {isEditingThreshold ? (
                      <input
                        type="number"
                        min="0"
                        max={maxDebtThreshold}
                        value={tempThreshold}
                        onChange={(e) => setTempThreshold(Number(e.target.value))}
                        className="w-24 px-3 py-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                      />
                    ) : (
                      <span className="text-white text-md font-semibold mr-2">
                        ${debtThreshold}
                      </span>
                    )}
                    {isEditingThreshold ? (
                      <button
                        onClick={() => {
                          setDebtThreshold(tempThreshold);
                          setIsEditingThreshold(false);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingThreshold(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-300">
                  You'll be notified when a friend's debt exceeds ${debtThreshold}
                </p>

                
              </>
            )}

            {/* Currency Selection Dropdown */}
            <div className="mt-4 flex gap-4 items-center">
              <label className="block">Preferred Currency:</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-2 text-sm text-gray-300">
              Your balance will be displayed in {selectedCurrency}
            </p>
          </section>
          
          <section className="mt-6">
            <button
              className="bg-red font-semibold text-white px-4 py-2 rounded-md"
              onClick={(e) => handleSignOut(e)}>
              Logout
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;