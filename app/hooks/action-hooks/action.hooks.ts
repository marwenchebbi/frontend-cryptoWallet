import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/interceptors/axiosInstance";
import { ActionDTO, FormattedAction } from "@/app/models/action";

// API function to create an action
const createAction = async (action: ActionDTO): Promise<FormattedAction> => {
  try {
    const response = await axiosInstance.post("/action", action, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errorDetails?.message || "Failed to create action.";
    throw new Error(errorMessage);
  }
};

// API function to fetch user actions
const getUserActions = async (userId: string): Promise<FormattedAction[]> => {
  try {
    const response = await axiosInstance.get(`/action/${userId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errorDetails?.message || "Failed to fetch actions.";
    throw new Error(errorMessage);
  }
};

// Custom hook for action-related operations
export const useAction = () => {
  // Query for fetching user actions
  const getActionsQuery = (userId: string) =>
    useQuery<FormattedAction[], Error>({
      queryKey: ["userActions", userId],
      queryFn: () => getUserActions(userId),
      enabled: !!userId, // Only fetch if userId is provided
      refetchOnWindowFocus: true,
    });

  // Mutation for creating an action
  const createActionMutation = useMutation<FormattedAction, Error, ActionDTO>({
    mutationFn: createAction,
    onError: (error) => {
      console.error("Action creation failed:", error.message);
    },
  });

  return {
    getActions: getActionsQuery,
    createAction: createActionMutation.mutateAsync,
    isCreating: createActionMutation.isPending,
    createError: createActionMutation.error,
  };
};