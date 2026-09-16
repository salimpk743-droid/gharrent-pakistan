import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full min-h-11 min-w-0 max-w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-muted/80 focus:border-forest focus:ring-2 focus:ring-forest/15 disabled:bg-sand disabled:text-muted";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} suppressHydrationWarning {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-28 py-2.5", className)} suppressHydrationWarning {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, className)} suppressHydrationWarning {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("grid min-w-0 gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted", className)}
      {...props}
    />
  );
}
