import { Left, Right } from "@icon-park/react";
import React, { useState, useEffect, useRef } from "react";

/**
 * 可折叠侧边栏布局组件
 * @param {object} props - 组件属性
 * @param {ReactNode} props.SidebarContent - 侧边栏内容
 * @param {ReactNode} props.MainContent - 主内容区域
 * @param {number} [props.defaultWidth=200] - 侧边栏默认宽度(px)
 * @param {boolean} [props.collapsible=true] - 是否可折叠
 * @param {string} [props.sidebarBg='bg-blue-600'] - 侧边栏背景色
 * @param {string} [props.sidebarText='text-white'] - 侧边栏文字颜色
 */

const CollapsibleSidebarLayout = ({
  SidebarContent,
  MainContent,
  defaultWidth = 200,
  collapsible = true,
  sidebarBg = "#ffffff",
  sidebarText = "#ffffff",
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 提供一个方法给MainContent调用，用于刷新侧边栏
  const refreshSidebar = () => {
    if (sidebarRef.current && typeof sidebarRef.current.refreshHistory === 'function') {
      sidebarRef.current.refreshHistory();
    }
  };

  return (
    <div className="flex h-full min-w-[800px] overflow-hidden">
      {/* 侧边栏容器 */}

      <div
        className={`bg-[${sidebarBg}] ${sidebarText} transition-all h-full duration-300 flex flex-col relative ${
          collapsed ? "w-0" : `w-[${defaultWidth}px]`
        }`}
        // style={{ height: windowHeight }}
      >
        {/* 侧边栏内容 */}
        {!collapsed && (
          <div className="overflow-y-auto flex-1 h-full">
            <SidebarContent ref={sidebarRef} />
          </div>
        )}

        {/* 可折叠按钮 */}
        {collapsible && (
          <div
            onClick={() => setCollapsed(!collapsed)}
            className={`absolute top-1/2 -translate-y-1/2 p-2 ml-1 right-[-24px] bg-[${sidebarBg}] flex justify-center items-center h-[40px] border rounded-[6px] w-5 cursor-pointer shadow-lg hover:opacity-80 transition-all ${
              collapsed ? "left-0" : `left-[${defaultWidth}px]`
            }`}
            style={{ zIndex: 100 }}
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? (
              <Right theme="outline" size="16" fill="#8D97A3"/>
            ) : (
              <Left theme="outline" size="16" fill="#8D97A3" />
            )}
          </div>
        )}
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto">
        <MainContent collapsed={collapsed} refreshSidebar={refreshSidebar} />
      </div>
    </div>
  );
};

export default CollapsibleSidebarLayout;
