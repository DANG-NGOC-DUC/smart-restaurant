import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary " +
        className
      }
      {...props}
    />
  );
}
