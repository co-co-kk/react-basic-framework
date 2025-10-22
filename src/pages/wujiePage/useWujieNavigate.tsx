import { useNavigate } from "react-router-dom";
import WujieReact from "wujie-react";

const { bus } = WujieReact;

export function useWujieNavigate(bus_event: string) {
  const navigate = useNavigate();

  // 跳转前拦截，超时兜底（比如500ms）
  const handleBeforeJump = (targetPath: string): Promise<boolean> => {
    return new Promise((resolve) => {
      let settled = false;
      // 超时兜底：如果500ms内子项目没响应，直接跳转
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(true);
        }
      }, 500);

      bus.$emit(bus_event, targetPath, (canLeave: boolean) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(canLeave);
        }
      });
    });
  };

  // 封装跳转
  const wujieNavigate = async (targetPath: string) => {
    const canLeave = await handleBeforeJump(targetPath);
    if (canLeave) {
      navigate(targetPath);
    }
  };

  return wujieNavigate;
}