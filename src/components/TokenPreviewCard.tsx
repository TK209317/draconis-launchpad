"use client";

import Image from "next/image";

interface TokenPreviewCardProps {
  name: string;
  symbol: string;
  totalSupply: string;
  type: "DRC20" | "DRC721" | "DRC1155" | "RWA";
}

export const TokenPreviewCard = ({
  name,
  symbol,
  totalSupply,
}: TokenPreviewCardProps) => {
  return (
    <div
      className="bg-[rgba(11,11,35,0.8)] backdrop-blur-sm flex flex-col gap-[30px] items-center px-[50px] py-[58px] rounded-[15px] shadow-[0px_0px_50px_0px_#3e43ae] w-full max-w-[400px]"
      data-component="token-preview-card"
    >
      {/* Icon */}
      <div className="relative w-[120px] h-[120px]">
        <div className="absolute inset-[-41.667%]">
          <Image
            alt="Token icon"
            className="block max-w-none"
            src={"/icon.svg"}
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Token Name and Symbol */}
      <div className="flex flex-col items-center gap-2 text-white">
        <p className="font-['Inter',sans-serif] font-bold text-[30px] whitespace-nowrap">
          {name || "Token Name"}
        </p>
        <p className="font-['Montserrat',sans-serif] font-medium text-[20px] whitespace-nowrap">
          {symbol || "Symbol"}
        </p>
      </div>

      {/* Total Supply */}
      <p className="font-['Montserrat',sans-serif] font-medium text-[16px] text-white flex items-center justify-center w-full">
        Total Supply: {totalSupply || "0"}
      </p>
    </div>
  );
};
