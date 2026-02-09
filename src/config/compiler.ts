/**
 * 编译器配置 - 仅使用Mock模式
 */

// Mock编译服务地址
export const MOCK_COMPILE_URL = 'http://localhost:8545/compile';

// 编译相关配置
export const compilerConfig = {
  // Mock服务配置
  mock: {
    url: MOCK_COMPILE_URL,
    timeout: 10000 // 超时时间：10秒
  }
}; 