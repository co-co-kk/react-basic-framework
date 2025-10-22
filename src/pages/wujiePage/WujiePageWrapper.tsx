import WujieReact from 'wujie-react';
import { useState, useEffect } from 'react';
import LoadingComponent from "@/components/loadingComponent";
import useAuthStore from "@/stores/authStore";
export interface WujiePageWrapperProps {
  name: string;
  url: string;
  plugins?: any[];
  props?: Record<string, any>;
  width?: string | number;
  height?: string | number;
  sync?: boolean;
  style?: React.CSSProperties;
}

export default function WujiePageWrapper({
  name,
  url,
  plugins = [],
  props = {},
  width = "100%",
  height = "100%",
  sync = false,
  style = {},
}: WujiePageWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);
  const setGlobalDownline = useAuthStore((state) => state.setGlobalDownline);
  // 监听 url 变化，强制刷新 iframe
  useEffect(() => {
    if (url !== currentUrl) {
      setCurrentUrl(url);
      // 强制刷新 iframe，通过设置 key 来触发重新渲染
      // 注意：这里不能直接修改 WujieReact 的 key，需要外部控制
    }
  }, [url, currentUrl]);

  // 合并props，注入loading和onLoaded
  const mergedProps = {
    ...props,
    loading,
    onLoaded: () => setLoading(false),
    setGlobalDownline
  };

  return (
    <div className="w-full h-full relative" style={style}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <LoadingComponent remSize={8} className="w-100 h-25" />
        </div>
      )}
      <WujieReact
        key={url} // 🔥 关键：通过 key 控制 iframe 重建
        name={name}
        url={url}
        plugins={plugins}
        width={width}
        height={height}
        sync={sync}
        props={mergedProps}
      />
    </div>
  );
}
