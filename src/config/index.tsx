import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { defineChain } from "viem";

// 从环境变量获取项目ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

if (!projectId) {
  throw new Error("Project ID is not defined");
}
// 从环境变量获取RPC URLs
const draconisRpcUrl = process.env.NEXT_PUBLIC_DRACONIS_RPC_URL;
const draconisExplorerUrl = process.env.NEXT_PUBLIC_DRACONIS_EXPLORER_URL;

// 根据环境动态设置应用URL
const getAppUrl = () => {
  if (typeof window !== "undefined") {
    // 浏览器环境：使用当前页面的origin
    const currentUrl = window.location.origin;
    return currentUrl;
  }
  // 服务端渲染或其他环境：回退到环境变量或默认值
  const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || "https://draconis.io";
  console.log("使用回退URL:", fallbackUrl);
  return fallbackUrl;
};

export const metadata = {
  name: "Draconis Launchpad",
  description: "一键发射平台 - 轻松创建代币和NFT",
  url: getAppUrl(), // 动态获取当前应用的URL
  icons: ["https://draconis.io/logo.png"], // 替换为实际的logo URL
};

// 定义DraConis自定义网络
export const DraConis = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_DRACONIS_CHAIN_ID!, 10),
  name: process.env.NEXT_PUBLIC_DRACONIS_NAME!,
  network: process.env.NEXT_PUBLIC_DRACONIS_NETWORK!,
  nativeCurrency: { name: "DAS", symbol: "DAS", decimals: 18 },
  rpcUrls: {
    default: { http: [draconisRpcUrl!] },
  },
  blockExplorers: {
    default: { name: "DragonconisScan", url: draconisExplorerUrl! },
  },
  testnet: true,
});

// 支持的网络 -
export const networks = [DraConis, sepolia] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

// 设置Wagmi适配器，将网络作为自定义链添加
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  chains: [DraConis], // 添加自定义链
});

// 使用WagmiAdapter的配置（包含AppKit的持久化设置）
export const config = wagmiAdapter.wagmiConfig;

// 添加自定义网络到钱包的函数
export const addDraconisNetwork = async () => {
  // 确保在浏览器环境中
  if (typeof window === "undefined") {
    return;
  }

  // 等待ethereum对象完全加载
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    if (window.ethereum && typeof window.ethereum.request === "function") {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.ethereum || typeof window.ethereum.request !== "function") {
    return;
  }

  const chainId =
    "0x" +
    parseInt(process.env.NEXT_PUBLIC_DRACONIS_CHAIN_ID!, 10).toString(16);
  const params = {
    chainId: chainId,
    chainName: process.env.NEXT_PUBLIC_DRACONIS_NAME!,
    nativeCurrency: {
      name: "DAS",
      symbol: "DAS",
      decimals: 18,
    },
    rpcUrls: [draconisRpcUrl], // 使用环境变量中的RPC URL
    blockExplorerUrls: [draconisExplorerUrl], // 使用环境变量中的浏览器URL
  };

  try {
    // 首先检查是否已经在这个网络上
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (currentChainId === chainId) {
      return;
    }

    // 尝试切换到网络
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      });
    } catch (switchError: unknown) {
      if (
        typeof switchError === "object" &&
        switchError !== null &&
        "code" in switchError &&
        typeof switchError.code === "number"
      ) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [params],
          });
          console.log("addDraconisNetwork");
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error("Failed to add/switch Draconis network:", error);
  }
};

// 获取支持的链ID列表
export const getSupportedChainIds = (): number[] => {
  const draconisChainId = parseInt(process.env.NEXT_PUBLIC_DRACONIS_CHAIN_ID!, 10);

  // 默认支持的链ID：Draconis 主网
  return [draconisChainId];
};

// 在DOM加载完成后尝试添加网络
if (typeof window !== "undefined") {
  // 使用更保守的方法等待页面和扩展完全加载
  const initNetwork = () => {
    if (document.readyState === "complete") {
      // 页面完全加载后再等待一段时间确保扩展初始化完成
      setTimeout(() => {
        addDraconisNetwork();
      }, 2000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => {
          addDraconisNetwork();
        }, 2000);
      });
    }
  };

  initNetwork();
}
