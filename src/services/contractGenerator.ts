// 合约参数类型定义

export interface ERC20TokenParams {
  name: string;
  symbol: string;
  premint?: string;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  permit?: boolean;
  votes?: boolean;
  flashMinting?: boolean;
  snapshots?: boolean;
  accessControl?: 'ownable' | 'roles' | 'none';
}

export interface ERC721TokenParams {
  name: string;
  symbol: string;
  baseUri?: string;
  burnable?: boolean;
  mintable?: boolean;
  incremental?: boolean;
  pausable?: boolean;
  votes?: boolean;
  enumerable?: boolean;
  uriStorage?: boolean;
  accessControl?: 'ownable' | 'roles' | 'none';
}

export interface ERC1155TokenParams {
  name: string;
  uri?: string;
  burnable?: boolean;
  mintable?: boolean;
  pausable?: boolean;
  supply?: boolean;
  accessControl?: 'ownable' | 'roles' | 'none';
} 