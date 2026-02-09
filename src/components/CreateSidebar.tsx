"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// Navigation items configuration
const navItems = [
  {
    to: "/create/drc20",
    label: "DRC20",
    icon: (
      <div className="relative w-[34px] h-card-gap">
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="w-full h-[7px] bg-[#0b0b23] border-2 border-white rounded-full" />
          <div className="w-full h-[7px] bg-[#0b0b23] border-2 border-white rounded-full" />
          <div className="w-full h-[7px] bg-[#0b0b23] border-2 border-white rounded-full" />
        </div>
      </div>
    ),
    fontSize: "text-[18px]",
  },
  {
    to: "/create/drc721",
    label: "NFT",
    icon: (
      <div className="w-[25px] h-[34px] relative">
        <svg viewBox="0 0 26 34" fill="none" className="w-full h-full">
          <path
            d="M13 2L2 7.5v19L13 32l11-5.5v-19L13 2z"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
    ),
    fontSize: "text-[18px]",
  },
  {
    to: "/create/rwa",
    label: "RWA",
    icon: (
      <div className="w-[34px] h-[34px] relative">
        <svg viewBox="0 0 34 34" fill="none" className="w-full h-full">
          <circle cx="17" cy="17" r="15" stroke="white" strokeWidth="2" />
          <path d="M17 8v18M8 17h18" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    ),
    fontSize: "text-[18px]",
  },
  {
    to: "/create/drc1155",
    label: "Multi-\nToken",
    icon: (
      <div className="w-[34px] h-[34px] relative">
        <svg viewBox="0 0 34 34" fill="none" className="w-full h-full">
          <circle cx="10" cy="10" r="4" stroke="white" strokeWidth="2" />
          <circle cx="24" cy="10" r="4" stroke="white" strokeWidth="2" />
          <circle cx="10" cy="24" r="4" stroke="white" strokeWidth="2" />
          <circle cx="24" cy="24" r="4" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    ),
    fontSize: "text-[16px]",
  },
  {
    to: "/create/contracts",
    label: "My\nContracts",
    icon: (
      <div className="w-card-gap h-[26px] relative">
        <div className="absolute inset-0">
          <div className="w-full h-[22px] bg-[#0b0b23] border-2 border-white rounded-[4px] absolute bottom-0" />
          <div className="w-[13px] h-[8px] bg-[#0b0b23] border-2 border-white rounded-[2px] absolute top-0 left-0" />
        </div>
      </div>
    ),
    fontSize: "text-[15px]",
  },
];

export function CreateSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:block shrink-0 sticky top-[72px] self-start">
        <nav className="w-[131px] h-[605px] bg-[#0b0b23]/80 backdrop-blur-sm border-[3px] border-[rgba(131,182,230,0.01)] rounded-card shadow-[0px_0px_50px_0px_#3e43ae] overflow-hidden">
          <div className="flex flex-col items-center justify-between h-full py-[40px] px-[10px]">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex flex-col items-center gap-[8px] transition-all hover:scale-105 ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {item.icon}
                  <span
                    className={`text-white ${item.fontSize} font-medium font-['Inter'] text-center leading-tight whitespace-pre-line`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b0b23]/95 backdrop-blur-sm border-t-[3px] border-[rgba(131,182,230,0.01)] shadow-[0px_-4px_30px_0px_#3e43ae] z-50">
        <div className="flex items-center justify-around h-[80px] px-[8px]">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <a
                key={item.to}
                href={item.to}
                className={`flex flex-col items-center gap-[4px] transition-all ${
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              >
                <div className="scale-75">{item.icon}</div>
                <span className="text-white text-[10px] font-medium font-['Inter'] text-center leading-tight whitespace-nowrap">
                  {item.label.replace("\n", " ")}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
