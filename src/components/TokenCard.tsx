"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

interface TokenCardProps {
  type: "drc20" | "nft" | "rwa" | "multi";
  titleKey: string;
  subtitleKey: string;
  order: number; // 1, 2, 3, or 4
}

export const TokenCard = ({ titleKey, subtitleKey, order }: TokenCardProps) => {
  const { t } = useLanguage();

  // Calculate background position based on order (1-4)
  // Order 1: 0-25% (left), Order 2: 25-50%, Order 3: 50-75%, Order 4: 75-100% (right)
  const getBackgroundPosition = (order: number) => {
    const positions = {
      1: "0%",
      2: "33.33%",
      3: "66.66%",
      4: "100%",
    };
    return positions[order as keyof typeof positions] || "0%";
  };

  return (
    <div className="relative flex flex-col items-center justify-between h-[366px] rounded-card shadow-card px-8 py-10 cursor-pointer transition-transform hover:scale-105 overflow-hidden">
      <Image
        src={"/card-bg.png"}
        alt="background"
        fill
        className="h-full z-10 opacity-25"
        style={{
          objectFit: "cover",
          objectPosition: `${getBackgroundPosition(order)} center`,
        }}
      />
      {/* Glassmorphism Background */}
      <div
        className="absolute inset-0 pointer-events-none rounded-card"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-card bg-linear-to-b from-white/40 to-[#d8c49a]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full text-center">
        {/* CREATE Label */}
        <p className="font-heading font-bold text-[13px] text-white uppercase tracking-wider">
          CREATE
        </p>

        {/* Icon Space - Placeholder for future icons */}
        <div className="flex-1 flex items-center justify-center">
          {/* You can add token-specific icons here */}
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-4xl text-white mb-6 drop-shadow-lg">
          {t(titleKey)}
        </h3>

        {/* Subtitle */}
        <p className="font-heading font-normal text-xl text-white leading-normal">
          {t(subtitleKey)}
        </p>
      </div>
    </div>
  );
};
