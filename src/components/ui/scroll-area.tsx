import React from "react";

// Minimal ScrollArea component used by the app.
// Keeps styling thin and delegates visuals to Tailwind classes passed via `className`.
export const ScrollArea = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className = "", children, ...rest }, ref) => {
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label="scrollable content"
      className={["overflow-auto", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </section>
  );
});

ScrollArea.displayName = "ScrollArea";

export default ScrollArea;
