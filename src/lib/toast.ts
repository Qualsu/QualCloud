import hotToast from "react-hot-toast";
import { toastTheme } from "@/config/const/toast.const";

function getOptions(type: keyof typeof toastTheme) {
  const theme = toastTheme[type];
  return {
    iconTheme: {
      primary: theme.icon,
      secondary: theme.iconBg,
    },
  };
}

export const toast = {
  success: (message: string) => hotToast.success(message, getOptions("success")),
  error: (message: string) => hotToast.error(message, getOptions("error")),
  loading: (message: string) => hotToast.loading(message, getOptions("loading")),
  dismiss: hotToast.dismiss,
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string | ((err: any) => string) },
  ) =>
    hotToast.promise(promise, messages, {
      loading: getOptions("loading"),
      success: getOptions("success"),
      error: getOptions("error"),
    }),
};
