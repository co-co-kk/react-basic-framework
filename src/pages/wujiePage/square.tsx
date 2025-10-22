import { useNavigate, useLocation } from "react-router-dom";
import { getmodeSquarelUrl, toLogin } from "@/utils/getUrl";
import { InstanceofPlugin, DocElementRectPlugin } from "wujie-polyfill";
import WujiePageWrapper from "./WujiePageWrapper";
import { useEffect, useState } from "react";

export default function Square() {
  const location = useLocation();
  const navigation = useNavigate();
  const path = location.pathname;
  const search = location.search;

  // 获取当前屏幕 高度
  function useWindowHeight() {
    const [Height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
      const handleResize = () => setHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return Height;
  }

  // 向子级传入 数据
  const props = {
    // 模型广场跳模型对比
    jumpSpuare: () => {
      navigation("/square/compare", {
        // state: { data },
      });
    },
    // 模型对比返回模型广场
    jumpBreadcrumb: () => navigation("/square"),
    toLogin,
    squareHeight: useWindowHeight() - 55,
  };

  return (
    <WujiePageWrapper
      name="modelSquare"
      url={`${getmodeSquarelUrl()}${path}${search ? search : ""}`}
      plugins={[InstanceofPlugin(), DocElementRectPlugin()]}
      props={props}
    />
  );
}
