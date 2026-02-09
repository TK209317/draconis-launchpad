// Pinata IPFS 配置
export const pinataConfig = {
  // 从环境变量中读取
  jwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'
};

// 检查环境变量是否存在
export const isPinataConfigured = (): boolean => {
  return Boolean(process.env.NEXT_PUBLIC_PINATA_JWT && pinataConfig.gateway);
}; 