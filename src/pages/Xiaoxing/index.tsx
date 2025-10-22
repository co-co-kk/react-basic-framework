import CollapsibleSidebarLayout from "@/components/CollapsibleSidebarLayout";
import LeftHistory from "./LeftHistory";
import MainContent from "./MainContent";
import { useEffect } from "react";
import { checkPermission } from "@/components/PermissionButton";

// 首页页面
const Xiaoxing = () => {
  useEffect(() => {
    // 定义一个异步函数来执行初始化逻辑
    //   autofit.init({
    //     dh: 1080,
    //     dw: 1920,
    //     el: ".assistant-home-class",
    //     resize: true
    // });
  }, []);

  const refreshSidebar = () => {
    // 可在此处添加刷新侧边栏的逻辑
  };

  return (
    <div className="w-full h-full">
      {checkPermission("assistant:conversation:list") ? (
        <CollapsibleSidebarLayout
          SidebarContent={LeftHistory}
          MainContent={MainContent}
          defaultWidth={250}
          sidebarBg="#ffffff"
        />
      ) : (
        <MainContent collapsed={undefined} refreshSidebar={refreshSidebar} />
      )}
    </div>
  );
};

export default Xiaoxing
