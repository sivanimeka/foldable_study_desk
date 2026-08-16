import { useEffect } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

export default function Toast({
  message,
  onClose,
}: {
  message: ToastMessage;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-500", ring: "ring-success-500/20" },
    info: { icon: Info, color: "text-primary-600", bg: "bg-primary-500", ring: "ring-primary-500/20" },
    error: { icon: AlertCircle, color: "text-error-600", bg: "bg-error-500", ring: "ring-error-500/20" },
  }[message.type];

  const Icon = styles.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 bg-white rounded-xl shadow-cardHover ring-1 ${styles.ring} px-4 py-3 max-w-sm`}>
        <div className={`w-8 h-8 rounded-full ${styles.bg} flex items-center justify-center text-white shrink-0`}>
          <Icon size={18} />
        </div>
        <p className="text-sm text-neutral-800 flex-1">{message.message}</p>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
