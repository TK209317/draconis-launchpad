/**
 * NFT元数据接口
 */
export interface NFTMetadata {
  name: string;
  description: string;
  file: File;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * 存储服务配置接口
 */
export interface StorageConfig {
  type: 'ipfs' | 's3';
  // 其他配置项会由具体实现类型定义
}

/**
 * 存储服务接口
 * 定义了NFT元数据上传的通用方法
 */
export interface IStorageService {
  /**
   * 上传NFT元数据
   * @param metadata NFT元数据
   * @returns 元数据URL
   */
  uploadMetadata(metadata: NFTMetadata): Promise<string>;
  
  /**
   * 获取存储服务名称
   */
  getServiceName(): string;
} 