import { ReactNode } from "react";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
}

export const ScrollSection = ({
  children,
  className = "",
}: ScrollSectionProps) => {
  return (
    <section
      className={`min-h-screen w-full snap-start snap-always flex items-center justify-center transition-all duration-1000 ease-out ${"opacity-100 translate-y-0"} ${className}`}
    >
      {children}
    </section>
  );
};
