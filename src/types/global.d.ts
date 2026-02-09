// 全局类型声明

// Ethereum provider 类型定义
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  isTokenPocket?: boolean;
  isOkxWallet?: boolean;
  isTrustWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isConnected?: () => boolean;
  on?: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
  chainId?: string;
  selectedAddress?: string;
}

// solc编译器类型
interface Window {
  ethereum?: EthereumProvider;
  Module: {
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
    _solidity_compile: (input: number) => number;
    stringToUTF8: (str: string, outPtr: number, maxBytesToWrite: number) => void;
    UTF8ToString: (ptr: number) => string;
    cwrap?: (name: string, returnType: string, argTypes: string[]) => (...args: unknown[]) => unknown;
    getValue?: (ptr: number, type: string) => unknown;
    setValue?: (ptr: number, value: unknown, type: string) => void;
  };
  solc: {
    compile: (input: string) => string;
    version?: () => string;
  };
} 