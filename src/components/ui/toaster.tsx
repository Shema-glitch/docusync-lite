
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, Info, AlertTriangle, LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
    success: CheckCircle,
    destructive: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};


export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant ? iconMap[variant] : null;
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {Icon && <Icon className="h-6 w-6 mt-0.5" />}
              <div className="grid gap-1">
                {title && (
                  <ToastTitle>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
