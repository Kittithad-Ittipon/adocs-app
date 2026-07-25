import { toast } from "sonner";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollCeleryTask = async (
  taskID: string,
  successMessage: string,
  errorMessage: string,
) => {
  let isTaskFinished = false;

  while (!isTaskFinished) {
    await sleep(2000);
    try {
      const statusRes = await fetch(`/api/tasks/${taskID}`);
      const statusData = await statusRes.json();

      if (statusRes.status === 200) {
        toast.success(successMessage, {
          description: statusData.message,
          duration: 5000,
        });
        return true;
      } else if (statusRes.status === 500 || statusRes.status === 400) {
        toast.error(errorMessage, {
          description: statusData.error || "Something went wrong",
          duration: 7000,
        });
        return false;
      }
    } catch (error) {
      console.error("Polling error:", error);
      toast.error("Network Error", {
        description: "Failed to check deployment status.",
      });
      return false;
    }
  }
};
