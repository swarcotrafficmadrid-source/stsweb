import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: "text-green-500",
      text: "text-green-800",
      iconPath: "M5 13l4 4L19 7"
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: "text-red-500",
      text: "text-red-800",
      iconPath: "M6 18L18 6M6 6l12 12"
    },
    warning: {
      bg: "bg-swarcoOrange/10 border-swarcoOrange/30",
      icon: "text-swarcoOrange",
      text: "text-swarcoOrange",
      iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    },
    info: {
      bg: "bg-swarcoBlue/10 border-swarcoBlue/30",
      icon: "text-swarcoBlue",
      text: "text-swarcoBlue",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  };

  const style = types[type] || types.info;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md w-full mx-4 animate-slide-up`}>
      <div className={`${style.bg} border rounded-xl shadow-lg p-4 flex items-start gap-3`}>
        <svg className={`w-6 h-6 ${style.icon} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.iconPath} />
        </svg>
        <p className={`${style.text} flex-1 text-sm`}>{message}</p>
        <button
          onClick={onClose}
          className={`${style.icon} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
