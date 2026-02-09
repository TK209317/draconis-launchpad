/**
 * 重试配置选项
 */
export interface RetryOptions {
  maxRetries: number;      // 最大重试次数
  delay: number;           // 重试间隔（毫秒）
  backoff: boolean;        // 是否使用指数退避
  onRetry?: (attempt: number, error: Error) => void; // 重试回调
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 5,
  delay: 1000,
  backoff: true
};

/**
 * 通用重试函数
 * @param fn 要重试的异步函数
 * @param options 重试配置选项
 * @returns Promise<T>
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 如果已达到最大重试次数，抛出错误
      if (attempt === opts.maxRetries) {
        console.error(`重试${opts.maxRetries}次后失败:`, lastError.message);
        throw lastError;
      }

      // 计算延迟时间（指数退避或固定延迟）
      const delayTime = opts.backoff 
        ? opts.delay * Math.pow(2, attempt) 
        : opts.delay;

      console.warn(`操作失败，第${attempt + 1}次重试，${delayTime}ms后重试:`, lastError.message);
      
      // 调用重试回调
      if (opts.onRetry) {
        opts.onRetry(attempt + 1, lastError);
      }

      // 等待指定时间后重试
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
  }

  throw lastError!;
}

/**
 * 带重试的fetch函数
 * @param input fetch输入参数
 * @param init fetch配置
 * @param retryOptions 重试配置
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(input, init);
    
    // 如果响应不成功，抛出错误以触发重试
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }, {
    maxRetries: 5,
    delay: 1000,
    backoff: true,
    ...retryOptions,
    onRetry: (attempt, error) => {
      console.warn(`Fetch失败，正在进行第${attempt}次重试:`, {
        url: typeof input === 'string' ? input : input instanceof URL ? input.toString() : '[Request object]',
        error: error.message
      });
      retryOptions.onRetry?.(attempt, error);
    }
  });
} 