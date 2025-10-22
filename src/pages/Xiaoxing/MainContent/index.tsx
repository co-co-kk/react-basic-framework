// 数智小星新页面
import xiaoxingxx from "@/assets/images/xiaoxingxx.gif";
import SwiperGridDemo from "../MainContent/ContentAreaCard/SwiperGridDemo";
import { useEffect, useMemo, useState, useCallback } from "react";

// 中间内容
const MainContent = ({ collapsed, refreshSidebar }) => {
  const userInfo = useMemo(()=>{
    return JSON.parse(localStorage.getItem('userInfo')||'{}')
  },[localStorage.getItem('userInfo')])
  const [showFourColumns, setShowFourColumns] = useState(1);
  const [queryWd, setQueryWd] = useState(1350);
  const [kgrid, setKgrid] = useState({ cols: 3, gap: 5 });

  // 获取屏幕宽度大小
  function useDebouncedWindowWidth(delay = 300) {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setWidth(window.innerWidth), delay);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(timeoutId);
      };
    }, [delay]);

    return width;
  }

  // 刷新历史记录的回调函数
  const handleRefreshHistory = useCallback(() => {
    if (refreshSidebar) {
      refreshSidebar();
    }
  }, [refreshSidebar]);

  const width = useDebouncedWindowWidth();

  useEffect(() => {
    let wid = !collapsed ? width - 250 : width;
    if (wid > 1400) {
      setQueryWd(1350);
      setKgrid({ cols: 3, gap: 6 });
    } else if (wid < 1400) {
      setQueryWd(950);
      setKgrid({ cols: 2, gap: 4 });
    }
  }, [collapsed, width]);

  return (
    <div className="flex-1 overflow-auto h-full scrollbar-hide flex justify-center p-l[-3px] bg-[#f6f9ff]">
      <div className="pt-[110px]">
        <div className="text-[24px] text-[#002FA7] w-full h-[60px] font-semibold flex justify-center items-center">
          <div
            style={{ backgroundImage: `url(${xiaoxingxx})` }}
            className="w-[54px] h-[41px] bg-cover bg-center bg-no-repeat"
          ></div>
          <div className="pl-5">
            您好, <span className="pl-5">{userInfo?.realName}</span>
          </div>
        </div>
        <div className="text-[16px] text-[#90A0AF] flex justify-center pt-[10px]">
          <div className="pl-[0px]">请选择一个应用，开启高效工作～</div>
        </div>

        {/* <div className="flex justify-end w-[1294px]">
            <div className="flex w-[400px] justify-end">
              <Input placeholder="请输入搜索内容" className="w-[240px]" />
              <div className="pl-[10px] flex items-center gap-[10px]">
                <div onClick={() => setShowFourColumns(1)}>
                  <img
                    src={showFourColumns == 2 ? sanlan : sanlanbg}
                    alt=""
                    className="h-[17px] cursor-pointer"
                  />
                </div>
                <div onClick={() => setShowFourColumns(2)}>
                  <img
                    src={showFourColumns == 1 ? silan : silanbg}
                    alt=""
                    className="h-[17px] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div> */}

        <div className="mt-[20px]" style={{ width: queryWd + "px" }}>
          {/* 卡片 */}
          <SwiperGridDemo
            Columns={showFourColumns}
            kgrid={kgrid}
            onRefreshHistory={handleRefreshHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
