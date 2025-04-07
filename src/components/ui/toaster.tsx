import { useToast } from '@/components/ui/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { XCircle } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();
  const TOAST_REMOVE_DELAY = 5000;

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center w-full justify-between">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <XCircle className="h-5 w-5 text-white/80" />
                </div>

                <div className="grid gap-0.5">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
              </div>

              {/* Action button positioned on right */}
              <div className="ml-auto">
                {action}
              </div>
            </div>

            <ToastClose />

            {/* Violet progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent">
              <div
                className="h-full bg-violet-500"
                style={{
                  animation: `progress ${TOAST_REMOVE_DELAY / 1000}s linear forwards`,
                }}
              />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}