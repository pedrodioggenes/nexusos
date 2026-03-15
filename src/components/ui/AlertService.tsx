import Swal from "sweetalert2";

// ─── Shared SweetAlert2 base config using NexusOS CSS vars ───────────────────
const BASE_CONFIG = {
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  customClass: {
    popup: "alert-popup",
    title: "alert-title",
    htmlContainer: "alert-text",
    confirmButton: "alert-button-confirm",
    cancelButton: "alert-button-cancel",
  },
} as const;

const PRIMARY_COLOR   = "hsl(var(--primary))";    // NexusOS crimson
const SECONDARY_COLOR = "hsl(var(--secondary))";  // NexusOS secondary surface
const DESTRUCTIVE_COLOR = "hsl(var(--destructive))";

export interface AlertOptions {
  title?: string;
  text?: string;
  icon?: "success" | "error" | "warning" | "info" | "question";
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export class AlertService {
  static success(title: string, text?: string) {
    return Swal.fire({
      ...BASE_CONFIG,
      title,
      text,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: PRIMARY_COLOR,
    });
  }

  static error(title: string, text?: string) {
    return Swal.fire({
      ...BASE_CONFIG,
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: DESTRUCTIVE_COLOR,
    });
  }

  static warning(title: string, text?: string) {
    return Swal.fire({
      ...BASE_CONFIG,
      title,
      text,
      icon: "warning",
      confirmButtonText: "OK",
      confirmButtonColor: PRIMARY_COLOR,
    });
  }

  static info(title: string, text?: string) {
    return Swal.fire({
      ...BASE_CONFIG,
      title,
      text,
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: PRIMARY_COLOR,
    });
  }

  static confirm(options: AlertOptions) {
    return Swal.fire({
      ...BASE_CONFIG,
      title: options.title ?? "Are you sure?",
      text: options.text,
      icon: options.icon ?? "question",
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText ?? "Yes",
      cancelButtonText:  options.cancelButtonText  ?? "Cancel",
      confirmButtonColor: options.confirmButtonColor ?? PRIMARY_COLOR,
      cancelButtonColor:  options.cancelButtonColor  ?? SECONDARY_COLOR,
    });
  }

  static async confirmAction(
    title: string,
    text: string,
    confirmText: string = "Yes, continue",
    action: () => Promise<void> | void,
    cancelText: string = "Cancel"
  ): Promise<boolean> {
    const result = await Swal.fire({
      ...BASE_CONFIG,
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: PRIMARY_COLOR,
      cancelButtonColor: SECONDARY_COLOR,
    });

    if (result.isConfirmed) {
      try {
        await action();
        return true;
      } catch (error) {
        console.error("AlertService: action failed:", error);
        AlertService.error(
          "Action Failed",
          "An error occurred while performing the action."
        );
        return false;
      }
    }
    return false;
  }
}

export default AlertService;
