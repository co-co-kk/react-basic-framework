import { Outlet, Link } from "react-router-dom";
import autofit from "autofit.js";
import Header from "./components/Header/index";
import { useEffect } from "react";

export default function MainLayout() {

 useEffect(() => {
    // 定义一个异步函数来执行初始化逻辑
    //   autofit.init({
    //     dh: 1080,
    //     dw: 1920,
    //     el: ".xiaoxing-class",
    //     resize: true
    // });
  }, []);
  return (
    <div className="w-full h-full overflow-hidden xiaoxing-class">
      {/* Sidebar */}
      <aside className="w-full flex">
        <Header></Header>
      </aside>
      <main className="h-[calc(100%-55px)] overflow-y-auto scrollbar-hidden w-full">
        <Outlet />
      </main>
    </div>
  );
}
