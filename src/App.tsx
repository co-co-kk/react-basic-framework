import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import router from "./routes/index.tsx";
import { ConfigProvider } from "antd";
import { Suspense, useEffect, useMemo } from "react";
import zhCN from "antd/locale/zh_CN";
import LoadingPage from "@/pages/LoadingPage/index";
import { RouterProvider, useLocation } from "react-router-dom";
export default function App() {

  return (

     <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          fontSize: 14,
          colorPrimary: "#002FA7", // 主色
          colorBgContainer: "#ffffff", // 容器背景色
          // colorBgLayout: "#f5f5f5", // 布局背景色
          // colorBgElevated: "#ffffff", // 浮层背景色
        },
        components: {
          Input: {
            colorBorder: "#DFE2E7",
          },
          Button: {
            controlOutline: "transparent", // 阴影
          },
          Form: {
            labelColor: "#092C4D", // 设置表单标签颜色
          },
          Select: {
            optionSelectedBg: '#E3ECFB', // 选中项背景色
            optionActiveBg: '#E3ECFB',   // hover 背景色
            colorBorder: '#DFE2E7',      // 默认边框色
            colorPrimaryHover: '#002FA7', // hover 边框色
            colorIcon:'#F8544B',
          },
          Cascader: {
            // colorIcon:'#F8544B',
            colorTextQuaternary: '#ccc',  // 仅清除按钮默认色（需配合CSS）
          },
          DatePicker: {
            colorIcon:'#F8544B',
          }
          // Layout: {
          //   headerBg: "#001529", // 顶部导航背景
          //   siderBg: "#001529", // 侧边栏背景
          //   bodyBg: "#f0f2f5", // 内容区背景
          // },
          // Menu: {
          //   itemBg: "transparent", // 菜单项背景
          //   subMenuItemBg: "#000c17", // 子菜单背景
          // },
        },
      }}
    >
      <Suspense fallback={<LoadingPage />}>
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  );
}
