import toast from "react-hot-toast";

/**
 * Shows a styled toast confirmation card and returns a Promise<boolean>.
 * Resolves true if the user confirms, false if they cancel.
 *
 * @example
 * const ok = await confirmToast({
 *   title: "Delete lesson?",
 *   description: "This cannot be undone.",
 *   confirmLabel: "Yes, Delete",
 *   confirmStyle: "bg-red-600",
 *   icon: <Trash2 size={18} className="text-red-500" />,
 * });
 * if (!ok) return;
 */
export function confirmToast({
  title,
  description,
  confirmLabel = "Confirm",
  confirmStyle = "bg-red-600",
  icon = null,
}) {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[260px]">
          <div className="flex items-start gap-3">
            {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
            <div>
              <p className="text-sm font-extrabold text-gray-800 leading-snug">
                {title}
              </p>
              {description && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className={`flex-1 py-2 rounded-lg text-white text-xs font-bold transition hover:opacity-90 cursor-pointer ${confirmStyle}`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: { padding: "14px", maxWidth: "340px" },
      }
    );
  });
}
