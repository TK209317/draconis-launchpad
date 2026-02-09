import { IStorageService, NFTMetadata } from './IStorageService';

/**
 * Pinata配置
 */
export interface PinataConfig {
  jwt: string;
  gateway: string;
}

/**
 * 基于Pinata的IPFS存储服务
 */
export class PinataService implements IStorageService {
  private config: PinataConfig;
  
  constructor(config: PinataConfig) {
    this.config = config;
  }
  
  /**
   * 获取服务名称
   */
  getServiceName(): string {
    return 'IPFS (Pinata)';
  }
  
  /**
   * 上传NFT元数据到IPFS
   * @param metadata NFT元数据（名称、描述和文件）
   * @returns 元数据URI (ipfs://{CID})
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    if (!metadata.file) {
      throw new Error('请提供媒体文件');
    }
    
    if (!this.config.jwt) {
      throw new Error('未配置Pinata JWT');
    }
    
    try {
      // 1. 上传媒体文件到IPFS
      const imageCid = await this.uploadFileToIPFS(metadata.file, `${metadata.name || 'NFT'}_image`);
      const imageUrl = `ipfs://${imageCid}`;
      
      // 2. 创建并上传元数据JSON
      const metadataJson = {
        name: metadata.name,
        description: metadata.description || '',
        image: imageUrl,
        ...(metadata.attributes && { attributes: metadata.attributes })
      };
      
      const metadataCid = await this.uploadJsonToIPFS(
        metadataJson, 
        `${metadata.name.replace(/\s+/g, '_')}_metadata.json`
      );
      
      // 返回IPFS URI
      return `ipfs://${metadataCid}`;
    } catch (error: unknown) {
      console.error('NFT元数据上传到IPFS失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`IPFS上传失败: ${errorMessage}`);
    }
  }
  
  /**
   * 上传文件到IPFS
   * @param file 要上传的文件
   * @param name 文件名称(用于Pinata元数据)
   * @returns 文件CID
   */
  private async uploadFileToIPFS(file: File, name: string): Promise<string> {
    // 创建FormData对象
    const form = new FormData();
    form.append("file", file);
    
    // 添加Pinata元数据
    form.append("pinataMetadata", JSON.stringify({ name }));
    
    // 添加Pinata选项
    form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
    
    // 发送请求
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.jwt}`
      },
      body: form
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`文件上传失败: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.IpfsHash) {
      throw new Error('文件上传失败，未返回有效CID');
    }
    
    return data.IpfsHash;
  }
  
  /**
   * 上传JSON对象到IPFS
   * @param jsonContent 要上传的JSON内容
   * @param name 文件名称(用于Pinata元数据)
   * @returns JSON对象的CID
   */
  private async uploadJsonToIPFS(jsonContent: object, name: string): Promise<string> {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name },
        pinataContent: jsonContent
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`JSON上传失败: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.IpfsHash) {
      throw new Error('JSON上传失败，未返回有效CID');
    }
    
    return data.IpfsHash;
  }
} 