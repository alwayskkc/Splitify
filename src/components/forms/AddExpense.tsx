import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  toast,
} from "@/components/ui";
import { ExpenseValidation } from "@/lib/validation";
import { Loader } from "@/components/shared";
import { useCreateExpense, useGetGroupById } from "@/lib/react-query/queries";
import { INewExpense } from "@/types";
import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { currencies } from '@/constants';
import { convertCurrency } from "@/lib/utils";
import { updateUser } from "@/lib/appwrite/api";

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { data: GroupData, isLoading: isGroupDataLoading } = useGetGroupById(id!);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const form = useForm<INewExpense>({
    resolver: zodResolver(ExpenseValidation),
    defaultValues: {
      desc: "",
      paidBy: user.id,
      group: id,
      Time: new Date().toISOString(),
      splitMember: [],
      amount: "",
      currency: "USD",
    },
  });

  const [isCheckboxError, setIsCheckboxError] = useState(false);

  const handleMemberCheckboxChange = (memberId: string) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.includes(memberId)
        ? prevMembers.filter((id) => id !== memberId)
        : [...prevMembers, memberId]
    );
    setIsCheckboxError(false);
  };

  useEffect(() => {
    form.setValue("splitMember", selectedMembers);
  }, [selectedMembers, form]);

  const [selectedPaidBy, setSelectedPaidBy] = useState<string>(user.id);

  const handlePaidByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPaidBy(event.target.value);
  };

  const { mutateAsync: createExpense, isLoading: isLoadingCreate } = useCreateExpense();

  const handleSubmit = async (value: INewExpense) => {
    if (
      selectedMembers.length === 0 ||
      (selectedMembers.length === 1 &&
        selectedMembers[0] === selectedPaidBy &&
        selectedPaidBy === selectedMembers[0])
    ) {
      setIsCheckboxError(true);
      return;
    }

    if (selectedPaidBy === null || selectedMembers === null) {
      toast({
        title: `Expense creation failed. Please try again.`,
      });
      return;
    }

    try {
      // Convert the amount to USD if it's not already in USD
      let amountInUSD = parseFloat(value.amount);
      if (selectedCurrency !== "USD") {
        amountInUSD = await convertCurrency(parseFloat(value.amount), selectedCurrency, "USD");
      }

      const newExpense = await createExpense({
        ...value,
        group: id!,
        paidBy: selectedPaidBy,
        Time: new Date().toISOString(),
        splitMember: selectedMembers,
        currency: selectedCurrency,
        amount: amountInUSD.toString(), // Store the amount in USD
      });

      if (!newExpense) {
        toast({
          title: `Expense creation failed. Please try again.`,
        });
      } else {
        try {
          // Update user's points
          await updateUser({
            userId: user.id,
            pointsEarned: (user.pointsEarned || 0) + 1,
          });
  
          toast({
            title: "Expense Added Successfully.",
            description: "Your expense has been added to the group.",
          });
          navigate(`/groups/${id}`);
        } catch (updateError) {
          console.error("Error updating user points:", updateError);
          // Still navigate and show success message, but log the points update error
          toast({
            title: "Expense Added Successfully.",
            description: "Your expense has been added to the group, but there was an issue updating your points.",
          });
          navigate(`/groups/${id}`);
        }
      }
    }catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Error creating expense",
        description: "An error occurred while creating the expense. Please try again.",
      });
    }
  };


  return (
    <Form {...form}>
      <div className="common-container">
        <div className="user-container">
          <div className="container p-5 flex flex-col">
            {isGroupDataLoading ? (
              <Loader />
            ) : GroupData?.length === 0 ? (
              <span className="text-white font-bold mb-2">
                You are not part of any groups.
              </span>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-2 text-white">
                  Add Expense in "{GroupData?.groupName}"
                </h2>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col gap-5 w-full max-w-5xl text-gray-300"
                >
                  <FormField
                    control={form.control}
                    name="desc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="shad-form_label">Description</FormLabel>
                        <FormControl>
                          <Input type="text" className="shad-input" {...field} />
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="shad-form_label">Amount</FormLabel>
                        <FormControl>
                          <Input type="number" className="shad-input" {...field} />
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="shad-form_label">Currency</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setSelectedCurrency(e.target.value);
                            }}
                            className="shad-input"
                          >
                            {currencies.map((currency) => (
                              <option key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="paidBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="shad-form_label mr-2">Paid By</FormLabel>
                          <FormControl>
                            <select
                              className="shad-input rounded"
                              {...field}
                              value={selectedPaidBy}
                              onChange={handlePaidByChange}
                            >
                              {GroupData?.Members?.map(
                                (member: { $id: string; name: string }) => (
                                  <option key={member.$id} value={member.$id}>
                                    {member.name}
                                  </option>
                                )
                              )}
                            </select>
                          </FormControl>
                          <FormMessage className="shad-form_message" />
                        </FormItem>
                      )}
                    />
                    <div>
                      <span className="shad-form_label mr-2">Split In</span>
                      <div
                        style={{ maxHeight: "100px", overflowY: "auto" }}
                        className="custom-scrollbar"
                      >
                        {GroupData?.Members?.map((member: any) => (
                          <div key={member.$id}>
                            <ul className="p-1 m-1 w-48 text-sm font-medium text-gray-900 bg-gray-600 border border-gray-600 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <li className="w-full border-b border-gray-600 rounded-t-lg dark:border-gray-600">
                                <label
                                  className="w-full py-1 ms-2 text-sm font-medium text-white dark:text-gray-300 flex items-center"
                                  htmlFor={member.$id}
                                >
                                  <input
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                    type="checkbox"
                                    id={member.$id}
                                    value={member.$id}
                                    checked={selectedMembers.includes(member.$id)}
                                    onChange={() => handleMemberCheckboxChange(member.$id)}
                                  />
                                  <span className="ml-2">{member.name}</span>
                                </label>
                              </li>
                            </ul>
                          </div>
                        ))}
                      </div>
                      {isCheckboxError && (
                        <span className="text-red text-sm mt-2">
                          Please select at least one member other than you.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 items-center justify-end">
                    <Button
                      type="button"
                      className="shad-button_dark_4"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      style={{ backgroundColor: "#1CC29F" }}
                      className="whitespace-nowrap"
                      disabled={isLoadingCreate}
                    >
                      {isLoadingCreate && <Loader />}
                      Add Expense
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
};

export default AddExpense;