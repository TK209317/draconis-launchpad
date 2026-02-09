"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';

// Web3状态类型定义
interface Web3State {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  provider: unknown;
}

interface Web3ContextType {
  web3State: Web3State;
}

// 创建上下文
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');

  // Derive state directly from AppKit hooks instead of storing in state
  const web3State: Web3State = {
    account: address || null,
    chainId: chainId ? Number(chainId) : null,
    isConnected: isConnected,
    provider: walletProvider
  };

  const contextValue: Web3ContextType = {
    web3State
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}

// 自定义Hook
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context; 