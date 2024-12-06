// export default GroupActivity;
import { AppwriteException } from 'appwrite';
import { Models } from "appwrite";
import {
  useDeleteActivity,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import DateDisplay from "./DateDisplay";
import ActivityImage from "./ActivityImage";
import { Button } from "../ui/button";
import Loader from "./Loader";
import { useState, useEffect } from 'react';
import { toast } from "../ui";
import { useQueryClient } from '@tanstack/react-query';

// Modified CurrencyConverter component
const CurrencyConverter = ({ amount, fromCurrency, toCurrency }: { amount: number, fromCurrency: string, toCurrency: string }) => {
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);

  useEffect(() => {
    const convertCurrency = async () => {
      // Only convert if currencies are different
      if (fromCurrency !== toCurrency) {
        try {
          const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
          const data = await response.json();
          const rate = data.rates[toCurrency];
          setConvertedAmount(Math.ceil((amount * rate)).toFixed(2));
        } catch (error) {
          console.error("Error converting currency:", error);
          setConvertedAmount("Error");
        }
      } else {
        setConvertedAmount(null); // No conversion needed
      }
    };

    convertCurrency();
  }, [amount, fromCurrency, toCurrency]);

  // Only display conversion if currencies are different
  return fromCurrency !== toCurrency && convertedAmount ? (
    <div>
      {`${convertedAmount} ${toCurrency} = ${amount} ${fromCurrency} `}
    </div>
  ) : null;
};

type UserCardProps = {
  activity: Models.Document;
};

const GroupActivity = ({ activity }: UserCardProps) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useGetCurrentUser();
  const [isHovered, setIsHovered] = useState(false);
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal]);

  const { mutateAsync: deleteActivityMutation, isLoading: isLoadingExpense } =
    useDeleteActivity();

  const handleDelete = async () => {
    try {
      setModal(false);
      await deleteActivityMutation({ activityId: activity.$id });
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries(['groupActivities']);
      queryClient.invalidateQueries(['groupDetails']);
      
      toast({
        title: "Expense Deleted Successfully.",
        description: "The expense has been removed from the group.",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      
      if (error instanceof AppwriteException) {
        if (error.code === 401) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to delete this expense.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Deletion Failed",
            description: `Error: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Deletion Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const isPaidByCurrentUser = activity.PaidBy.$id === currentUser?.$id;
  const isCurrentUserInvolved = activity.splitMember?.some(
    (member: { $id: string }) => member.$id === currentUser?.$id
  ) || false;
  const splitCount = activity.splitMember?.length ?? 0;

  // Calculate individual split amount
  const totalAmount = parseFloat(activity.Amout);
  const individualAmount = totalAmount / splitCount;

  // Determine user's involvement and calculate appropriate amount
  let userAmount = 0;
  let amountMessage = "";
  if (isPaidByCurrentUser) {
    if (isCurrentUserInvolved) {
      userAmount = totalAmount - individualAmount;
      amountMessage = `You get back ${"USD"} ${userAmount.toFixed(2)}`;
    } else {
      userAmount = totalAmount;
      amountMessage = `You get back ${"USD"} ${userAmount.toFixed(2)}`;
    }
  } else if (isCurrentUserInvolved) {
    userAmount = -individualAmount;
    amountMessage = `You owe ${"USD"} ${Math.abs(userAmount).toFixed(2)}`;
  } else {
    amountMessage = `Not involved`;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }} className="pb-2">
        <div style={{ display: "flex", alignItems: "center" }}>
          <ActivityImage Desc={activity.Desc} Type={"activity"} />
          <p className="text-lg font-bold mb-1 mt-2">&ensp;{activity.Desc}</p>
        </div>
        <span className="text-blue-500 text-lg font-bold mt-2">
          {"USD"} {totalAmount.toFixed(2)}
        </span>
      </div>

      <DateDisplay dateTimeString={activity.Time} />
      <p>
        Added by{" "}
        <span className={`font-semibold capitalize ${
          isPaidByCurrentUser ? "text-green-500" : "text-teal-400"
        }`}>
          "{activity.PaidBy.name}"
        </span>{" "}
        Split among{" "}
        <span className="font-bold text-teal-400 capitalize">
          {activity.splitMember?.map(
            (member: {
              UserName: string;
              email: string;
              accountId: string;
              name: string;
              $id: string;
            }) => <span key={member.$id}>{member.name}, </span>
          )}
        </span>{" "}
      </p>
      <p className={`${
        userAmount > 0
          ? "text-green-500 font-semibold"
          : userAmount < 0
            ? "text-red font-semibold"
            : "text-indigo-700 font-semibold"
      }`}>
        {amountMessage}
      </p>
      <p className="text-gray-500">
        Individual split: {"USD"} {individualAmount.toFixed(2)}
      </p>
      
      <CurrencyConverter 
        amount={totalAmount}
        fromCurrency="USD"
        toCurrency={activity.Currency} // You can make this dynamic based on user preference
      />
      {console.log(activity)}
      <Button
        onClick={toggleModal}
        style={{
          backgroundColor: isHovered || isLoadingExpense ? "#FF6347" : "#E53E3E",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          cursor: isLoadingExpense ? "not-allowed" : "pointer",
          opacity: isLoadingExpense ? 0.6 : 1,
          transition: "background-color 0.3s",
          float: "right",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoadingExpense}
      >
        {isLoadingExpense && <Loader />}
        {isLoadingExpense ? "Deleting..." : "Delete"}
      </Button>
      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <h2 className="text-neutral-300 text-2xl font-bold mb-2">
              Do you want to delete this expense?
            </h2>
            <p className="text-neutral-400 font-semibold mb-2">
              If deleted, the expense will be permanently removed.
            </p>
            <Button className="btn bg-red hover:bg-red" onClick={toggleModal}>
              Cancel
            </Button>
            <Button className="btn m-2 bg-green-600" onClick={handleDelete}>
              Confirm
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupActivity;