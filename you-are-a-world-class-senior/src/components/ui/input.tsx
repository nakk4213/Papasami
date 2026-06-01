import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
