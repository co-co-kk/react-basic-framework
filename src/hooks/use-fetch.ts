import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface FetchOptions {
  immediate?: boolean; // 是否立即执行请求
  dependencies?: any[]; // 依赖数组，变化时重新请求
}

/**
 * 数据获取自定义 Hook
 * 封装常见的异步数据获取逻辑
 *
 * @param fetchFn 异步获取数据的函数
 * @param options 配置选项
 * @returns {FetchState<T> & { refetch: () => Promise<void> }} 数据和操作函数
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, isLoading, error, refetch } = useFetch(
 *     () => fetchUser(userId),
 *     { dependencies: [userId] }
 *   );
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{user?.name}</h1>
 *       <button onClick={refetch}>重新加载</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {},
): FetchState<T> & { refetch: () => Promise<void> } {
  const { immediate = true, dependencies = [] } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const [shouldFetch, setShouldFetch] = useState(immediate);

  /**
   * 执行数据获取
   */
  const executeFetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await fetchFn();
      setState({
        data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }, [fetchFn]);

  /**
   * 手动重新获取数据
   */
  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  // 监听依赖变化
  useEffect(() => {
    if (shouldFetch) {
      executeFetch();
      setShouldFetch(false);
    }
  }, [shouldFetch, executeFetch]);

  // 监听依赖数组变化
  useEffect(() => {
    if (immediate && dependencies.length > 0) {
      setShouldFetch(true);
    }
  }, [immediate, dependencies]);

  return {
    ...state,
    refetch,
  };
}
