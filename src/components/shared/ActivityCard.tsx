import { Models } from "appwrite";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import ActivityImage from "./ActivityImage";
import DateDisplay from "./DateDisplay";
import CurrencyConverter from "./CurrencyConverter";

type UserCardProps = {
  activity: Models.Document;
};

const ActivityCard = ({ activity }: UserCardProps) => {
  const { data: currentUser } = useGetCurrentUser();

  const isPaidByCurrentUser = activity.PaidBy.$id === currentUser?.$id;
  const isCurrentUserInvolved =
    activity.splitMember?.some(
      (member: { $id: string }) => member.$id === currentUser?.$id
    ) || false;
  const splitCount = activity.splitMember?.length ?? 0;

  let amountMessage = "";

  if (isPaidByCurrentUser && isCurrentUserInvolved) {
    const individualAmount = parseFloat(activity.Amout) / splitCount;
    const getback = parseFloat(activity.Amout) - individualAmount;
    amountMessage = `You get back $${getback.toFixed(2)}`;
  } else if (isPaidByCurrentUser && !isCurrentUserInvolved) {
    const individualAmount = parseFloat(activity.Amout);
    amountMessage = `You get back $${individualAmount.toFixed(2)}`;
  } else if (!isPaidByCurrentUser && isCurrentUserInvolved) {
    const individualAmount = parseFloat(activity.Amout) / splitCount;
    amountMessage = `You owe $${individualAmount.toFixed(2)}`;
  } else {
    amountMessage = `Not involved`;
  }
  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "space-between" }}
        className="pb-2">
        <div style={{ display: "flex", alignItems: "center" }}>
          <ActivityImage Desc={activity.Desc} Type={"activity"} />
          <p className="text-lg font-bold mb-1 mt-2">&ensp;{activity.Desc}</p>
        </div>
        <span className="text-blue-500 text-sm font-bold mt-2">
          {/* &#36;{activity.Amout} */}
          {activity.Currency} <CurrencyConverter 
          amount={parseFloat(activity.Amout)}
          fromCurrency="USD"
          toCurrency={activity.Currency}
        />
         {"  "}≈ {" USD "}{parseFloat(activity.Amout).toFixed(2)}
        </span>
        
      </div>
      <p>
        Added by{" "}
        <span
          className={`font-semibold capitalize ${
            isPaidByCurrentUser ? "text-green-500 capitalize" : "capitalize"
          }`}>
          "{activity.PaidBy.name}"
        </span>{" "}
        in{" "}
        <span className="font-semibold capitalize">
          "{activity.Group.groupName}"
        </span>
      </p>
      <div>
        <DateDisplay dateTimeString={activity.Time} />
      </div>
      <p
        className={`${
          isPaidByCurrentUser
            ? "text-green-500 font-semibold capitalize"
            : !isPaidByCurrentUser && isCurrentUserInvolved
              ? "text-red font-semibold capitalize"
              : "text-indigo-700 font-semibold capitalize"
        }`}>
        {amountMessage}
      </p>
    </>
  );
};

export default ActivityCard;
