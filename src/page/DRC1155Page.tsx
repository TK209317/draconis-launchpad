"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { NFTCreator } from "../components/NFTCreator";
import { ConnectWallet } from "../components/ConnectWallet";
import { TokenPreviewCard } from "../components/TokenPreviewCard";

export const DRC1155Page = () => {
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
          <NFTCreator type="DRC1155" onFormChange={setPreviewData} />
        )}
      </div>
      {isConnected && (
        <div className="w-full flex-1">
          <TokenPreviewCard
            name={previewData.name}
            symbol={previewData.symbol}
            totalSupply={previewData.totalSupply}
            type="DRC1155"
          />
        </div>
      )}
    </div>
  );
};
