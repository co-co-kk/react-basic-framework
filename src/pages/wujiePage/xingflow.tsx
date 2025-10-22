import { getXingFlowUrl, toLogin } from "@/utils/getUrl";
import {
  InstanceofPlugin,
  DocElementRectPlugin,
  LocationReloadPlugin,
} from "wujie-polyfill";
import { useLocation, useNavigate } from "react-router-dom";
import WujiePageWrapper from "./WujiePageWrapper";
import { useEffect, useState } from "react";

// flow 工作流
export default function QkXingFlow() {
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

  const props = {
    jump: (name: string) => navigation(`/${name}`),
    toLogin,
    squareHeight: useWindowHeight() - 55,
  };

  return (
    <WujiePageWrapper
      name="xingflow"
      url={`${getXingFlowUrl()}${path}${search ? search : ""}`}
      plugins={[
        InstanceofPlugin(),
        DocElementRectPlugin(),
        LocationReloadPlugin(),
      ]}
      props={props}
    />
  );
}
