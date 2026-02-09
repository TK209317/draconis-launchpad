// 共享工具函数

// 获取区块浏览器URL
export const getBlockExplorerUrl = (
  chainId: number,
  address: string,
  type: "address" | "tx" = "address"
): string => {
  const customExplorer = process.env.NEXT_PUBLIC_DRACONIS_EXPLORER_URL;
  const path = type === "tx" ? "tx" : "address";

  return `${customExplorer}/${path}/${address}`;
};

// 获取网络名称
export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "Ethereum Mainnet";
    case 5:
      return "Goerli Testnet";
    case 11155111:
      return "Sepolia Testnet";
    case 56:
      return "BSC Mainnet";
    case 97:
      return "BSC Testnet";
    case 137:
      return "Polygon Mainnet";
    case 80001:
      return "Polygon Mumbai";
    case 1356:
      return "Draconis Testnet";
    case 8989:
      return "Draconis Mainnet";
    case 42161:
      return "Arbitrum One";
    case 10:
      return "Optimism";
    case 43114:
      return "Avalanche C-Chain";
    case 8453:
      return "Base";
    default:
      return `Chain ID: ${chainId}`;
  }
};

// 获取 Blockscout API 地址
export const getBlockscoutApiUrl = (chainId: number): string => {
  switch (chainId) {
    case 11155111:
      return "https://eth-sepolia.blockscout.com/api/v2";
    case 1356:
      return "https://scan.adamant368.com/api/v2";
    default:
      // 对于未知网络，检查是否在本地/内部环境下
      if (
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          /^10\.\d+\.\d+\.\d+$/.test(window.location.hostname))
      ) {
        const customExplorer = process.env.NEXT_PUBLIC_DRACONIS_EXPLORER_URL;
        return customExplorer ? `${customExplorer}/api/v2` : "";
      }
      return "";
  }
};
