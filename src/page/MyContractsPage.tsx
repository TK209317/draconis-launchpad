"use client";

import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { getUserContracts } from "../actions/contracts";
import type { ContractInfo } from "../actions/contracts";
import { MyContractsClient } from "../components/MyContractsClient";
import { ConnectWallet } from "../components/ConnectWallet";

export const MyContractsPage = () => {
  const { address, isConnected } = useAppKitAccount();
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadContracts = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const userContracts = await getUserContracts(address);
      setContracts(userContracts);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadContracts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="w-full">
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full bg-[rgba(11,11,35,0.8)] backdrop-blur-sm rounded-card shadow-[0px_0px_50px_0px_#3e43ae] p-[40px]">
        {isLoading ? (
          <div className="text-center text-white">Loading contracts...</div>
        ) : (
          <MyContractsClient
            ownerAddress={address || ""}
            initialContracts={contracts}
          />
        )}
      </div>
    </div>
  );
};
