// 导出合约参数类型定义
export {
  type ERC20TokenParams,
  type ERC721TokenParams,
  type ERC1155TokenParams
} from './contractGenerator';


// 导出类型定义（为了向后兼容）
export type LogCallback = (level: 'info' | 'warn' | 'error', message: string, details?: unknown) => void;
export type ProgressCallback = (percent: number, message: string) => void; 