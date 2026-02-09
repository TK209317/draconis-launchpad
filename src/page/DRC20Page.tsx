"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { TokenCreator } from "../components/TokenCreator";
import { ConnectWallet } from "../components/ConnectWallet";
import { TokenPreviewCard } from "../components/TokenPreviewCard";

export const DRC20Page = () => {
  const { isConnected } = useAppKitAccount();
  const [previewData, setPreviewData] = useState({
    name: "",
    symbol: "",
    totalSupply: "0",
  });

  return (
    <div className="flex flex-col md:flex-row gap-[20px] md:gap-[40px] items-start">
      <div className="w-full flex-1 px-[8px] md:px-[40px]">
        {!isConnected ? (
          <ConnectWallet />
        ) : (
          <TokenCreator type="DRC20" onFormChange={setPreviewData} />
        )}
      </div>
      {isConnected && (
        <div className="w-full flex-1">
          <TokenPreviewCard
            name={previewData.name}
            symbol={previewData.symbol}
            totalSupply={previewData.totalSupply}
            type="DRC20"
          />
        </div>
      )}
    </div>
  );
};
