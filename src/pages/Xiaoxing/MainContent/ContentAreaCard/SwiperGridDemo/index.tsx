import { useEffect, useState } from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { CloseSmall, Left, Right, Plus, ContrastView } from "@icon-park/react";
import kefuxx from "@/assets/images/kefuxx.png";
import FlowListPopup from "../FlowListPopup";
import { RiSearchLine } from "@remixicon/react";
import {
  getCollect,
  deleteCollect,
} from "@/api/shuzhixiaoxing/use-get-messages";
import { useNavigate } from "react-router-dom";
import { Button, Input, message, Popconfirm,Tabs } from "antd";
import TsTooltip from "@/components/TsTooltip";
import TsImg from "@/components/TsImg";
import PermissionButton, {
  checkPermission,
} from "@/components/PermissionButton";
/**
 * 卡片项类型定义
 */
interface CardItem {
  id?: string;
  key?: string;
  name?: string;
  description?: string;
  types?: string;
  [key: string]: any;
}

/**
 * 网格配置类型
 */
interface KgirdConfig {
  cols: number; // 列数
  gap: number; // 间距
}

/**
 * 自定义导航组件props
 */
interface CustomNavigationProps {
  onSlideChange?: (index: number) => void;
}

/**
 * 分页组件props
 */
interface SwiperPageProps {
  totalPages: number; // 总页数
}

/**
 * 主组件props
 */
interface SwiperGridDemoProps {
  Columns?: any;
  kgrid: KgirdConfig;
  onRefreshHistory?: () => void; // 添加刷新历史记录的回调函数
}

/**
 * 自定义导航组件
 * 处理Swiper左右箭头导航
 */
const CustomNavigation: React.FC<CustomNavigationProps> = () => {
  const swiper = useSwiper();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // 监听swiper状态变化
  useEffect(() => {
    const updateState = () => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    };

    swiper.on("slideChange", updateState);
    return () => swiper.off("slideChange", updateState);
  }, [swiper]);

  return (
    <>
      {/* 左箭头按钮 */}
      <button
        className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 p-2 mx-4 rounded-full bg-white shadow-md transition-colors ${isBeginning
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-gray-100 cursor-pointer"
          }`}
        onClick={() => !isBeginning && swiper.slidePrev()}
        disabled={isBeginning}
        aria-label="Previous slide"
      >
        <Left
          theme="filled"
          size="24"
          fill={isBeginning ? "#999" : "#8D97A3"}
        />
      </button>

      {/* 右箭头按钮 */}
      <button
        className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 p-2 mx-4 rounded-full bg-white shadow-md transition-colors ${isEnd
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-gray-100 cursor-pointer"
          }`}
        onClick={() => !isEnd && swiper.slideNext()}
        disabled={isEnd}
        aria-label="Next slide"
      >
        <Right theme="filled" size="24" fill={isEnd ? "#999" : "#8D97A3"} />
      </button>
    </>
  );
};

/**
 * 分页指示器组件
 */
const SwiperPage: React.FC<SwiperPageProps> = ({ totalPages }) => {
  // 只有总页数小于7时才显示分页
  return totalPages < 7 ? (
    <div className="swiper-pagination mt-6 flex justify-center items-center"></div>
  ) : <div className="swiper-pagination mt-6 flex justify-center items-center"></div>;
};

/**
 * 主组件 - 网格滑动卡片布局
 */
const SwiperGridDemo: React.FC<SwiperGridDemoProps> = ({ Columns, kgrid, onRefreshHistory }) => {
  const navigate = useNavigate();
  // 状态管理
  const [newProjectModal, setNewProjectModal] = useState(false); // 新增项目弹窗
  const [cardList, setCardList] = useState<CardItem[]>([]); // 卡片列表数据
  const [groupedData, setGroupedData] = useState<CardItem[][]>([]); // 分组后的数据
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null); // 当前打开的确认框ID
  const [swiperInstance, setSwiperInstance] = useState<any>(null); // Swiper实例

  // 计算每页显示的项目数
  const itemsPerPage = kgrid?.cols === 2 ? 4 : 6;

  // 初始化加载数据
  // useEffect(() => {
  //   getCardList("");
  // }, []);

  /**
   * 获取卡片列表数据
   * @param name 搜索名称
   */
  const getCardList = async (name: string) => {
    try {
      if(activeKey == '1') {
        // const res = await getCollect({ name });
        setCardList([]);
      }else if(activeKey == '2') {
        const res = await getCollect({ name });
        setCardList(res?.data ||  []);

      }
    } catch (error) {
      console.error("获取卡片列表失败:", error);
    }
  };

  // 新增项目后刷新列表
  const queryFlowIdFun = () => {
    // getCardList("");
  };

  // 数据分组处理
  useEffect(() => {
    const groupCards = () => {
      const result: CardItem[][] = [];
      // 按每页项目数分组
      for (let i = 0; i < cardList.length; i += itemsPerPage) {
        result.push(cardList.slice(i, i + itemsPerPage));
      }

      // 添加"添加应用"按钮
      if (checkPermission("assistant:app:add") && activeKey !== "1") {
        if (result.length === 0) {
          result.push([{ key: "添加应用" }]);
        } else {
          const lastChunk = result[result.length - 1];
          if (lastChunk.length < itemsPerPage) {
            lastChunk.push({ key: "添加应用" });
          } else {
            result.push([{ key: "添加应用" }]);
          }
        }
      }

      return result;
    };

    setGroupedData(groupCards());
  }, [itemsPerPage, cardList]);

  /**
   * 删除卡片处理
   * @param id 卡片ID
   * @param e 事件对象
   */
  const handleDelete = async (id: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteCollect(id);
      message.success("删除成功");
      // getCardList("");
      setOpenPopconfirmId(null); // 删除后关闭确认框
      // 调用刷新历史记录的回调函数
      if (onRefreshHistory) {
        onRefreshHistory();
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  /**
   * 导航到详情页
   * @param obj 卡片数据
   * @param e 事件对象
   */
  const handleNavigate = (obj: CardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!obj.id || !obj.types) return;

    // 根据类型跳转不同路由
    const routeKey =
      obj.types === "助理"
        ? `/assistant/aideChat/${obj.id}`
        : // : `/flowChat/${obj.id}`;
        `/xingflow/flowChat/${obj.id}`;
    navigate(routeKey);
  };

  /**
   * 控制确认框显示/隐藏
   * @param visible 是否显示
   * @param id 卡片ID
   */
  const handlePopconfirmVisibleChange = (visible: boolean, id: string) => {
    if (visible) {
      setOpenPopconfirmId(id); // 只允许打开一个确认框
    } else {
      setOpenPopconfirmId(null);
    }
  };

  /**
   * Swiper初始化回调
   * @param swiper Swiper实例
   */
  const handleSwiperInit = (swiper: any) => {
    setSwiperInstance(swiper);
    // 滑动时关闭所有确认框
    swiper.on("slideChange", () => {
      setOpenPopconfirmId(null);
    });
    // 触摸开始时关闭确认框
    swiper.on("touchStart", () => {
      setOpenPopconfirmId(null);
    });
  };

  /**
   * 渲染卡片内容
   * @param cardObj 卡片数据
   * @param cardIndex 卡片索引
   * @returns 卡片JSX
   */
  const renderCardContent = (cardObj: CardItem, cardIndex: number) => {
    // 添加应用按钮
    if (cardObj?.key === "添加应用" && checkPermission("assistant:app:add")) {
      return (
        <div
          key={`add-${cardIndex}`}
          onClick={() => setNewProjectModal(true)}
          className="h-[120px] w-[386px] rounded-[10px] border border-[#DFE2E7] border-dashed text-[#8D97A3] flex flex-col items-center justify-center cursor-pointer hover:border-[#002FA7] hover:shadow-[0px_1px_6px_0px_rgba(227,236,251,1)] transition-all duration-200"
        >
          <Plus theme="outline" size="30" fill="#8D97A3" />
          <div className="text-sm">添加应用</div>
        </div>
      );
    }

    // 普通卡片
    return (
      <div
        className="group relative flex flex-col justify-between w-[386px] h-[120px] pt-[20px] pl-[19px] bg-[#ffffff] rounded-[10px] cursor-pointer border border-transparent hover:border-[#002FA7] hover:shadow-[0px_1px_6px_0px_rgba(227,236,251,1)] transition-all duration-200"
        key={`card-${cardObj.id}-${cardIndex}`}
        onClick={(e) => {
          // 如果有打开的确认框则关闭，否则跳转
          if (openPopconfirmId) {
            setOpenPopconfirmId(null);
            e.stopPropagation();
          } else {
            handleNavigate(cardObj, e);
          }
        }}
      >
        <div className="w-full pr-[19px]">
          <div className="flex items-center pb-2">
            <div className="w-[30px] h-[23px]">
              <TsImg tsImg={kefuxx} />
            </div>
            <div className="flex items-center flex-1 justify-between pl-2">
              <div className="text-[#092C4D] text-[16px] font-[500] group-hover:text-[#002FA7] flex items-center w-[280px]">
                <TsTooltip node={{ label: cardObj?.name, fontWig: 500 }} />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                {/* 删除确认框 */}
                <Popconfirm
                  title=""
                  icon=""
                  description={`确定要删除 ${cardObj.name} 吗?`}
                  onConfirm={(e) => handleDelete(cardObj.id, e)}
                  onCancel={() => setOpenPopconfirmId(null)}
                  cancelText="取消"
                  okText="确认"
                  open={openPopconfirmId === cardObj.id}
                  onOpenChange={(visible) =>
                    handlePopconfirmVisibleChange(visible, cardObj.id || "")
                  }
                >
                  <PermissionButton permission="assistant:app:remove">
                    <CloseSmall
                      theme="outline"
                      size="18"
                      fill="#8D97A3"
                      className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 切换确认框状态
                        setOpenPopconfirmId(
                          openPopconfirmId === cardObj.id
                            ? null
                            : cardObj.id || null
                        );
                      }}
                    />
                  </PermissionButton>
                </Popconfirm>
              </div>
            </div>
          </div>
          <div className="text-[#90A0AF] text-sm line-clamp-2">
            <TsTooltip
              node={{
                label: cardObj?.description,
                maxLines: 2,
              }}
              tooltipWidth={400}
              tooltipMaxHeight={300}
            />
          </div>
        </div>
        {/* 卡片类型标签 */}
        <div className="flex justify-end mt-[4px]">
          <div
            className="text-[12px] px-3 h-[20px] flex items-center justify-center rounded-tl-[10px] rounded-br-[10px] text-[#ffffff]"
            style={{
              backgroundColor:
                cardObj?.types === "工作流" ? "#00A4EE" : "#1AB081",
            }}
          >
            {cardObj?.types}
          </div>
        </div>
      </div>
    );
  };
  const [activeKey,setActiveKey] = useState("1")
  useEffect(()=>{
    getCardList('')
  },[activeKey])

  return (
    <>
      {/* 搜索栏 */}

      <PermissionButton permission="assistant:app:list">
        <div
          className="flex justify-end mb-3"
          style={{ padding: itemsPerPage === 4 ? "0 79px" : "0 74px" }}
        >
          <Input
            prefix={<RiSearchLine size="18px" color="#8D97A3" />}
            placeholder="请输入搜索内容"
            className="w-[240px] text-[14px]"
            // onChange={(e) => getCardList(e.target.value)}
            allowClear
          />
        </div>
      <div/>

      {/* 123 */}
      {/* <Button className="text-[#fff] bg-[#f60]"  icon={<ContrastView size={18} />}>123</Button> */}

        {/* 主滑动区域 */}
        <div className="w-full flex my-5 px-10">
          <div className={`mx-10 ${activeKey == '1' && 'text-[#002FA7]  border-b-[2px] border-[#002FA7]'}`} onClick={()=>setActiveKey('1')}>推荐应用</div>
          <div onClick={()=>setActiveKey('2')} className={`${activeKey == '2' && 'text-[#002FA7]  border-b-[2px] border-[#002FA7]'}`}>全部应用</div>
        </div>
        <div className="relative pb-11">
          <Swiper
            modules={[Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
              // type: "bullets",
            }}
            className="swiper-grid-container grid grid-cols-3 gap-6 py-1"
            onSwiper={handleSwiperInit} // 初始化回调
          >
            {/* 导航箭头 */}
            {groupedData.length > 1 && <CustomNavigation />}

            {/* 分组渲染卡片 */}
            {groupedData.map((group, groupIndex) => (
              <SwiperSlide key={`group-${groupIndex}`} className="px-20">
                <div
                  className={`grid grid-cols-${kgrid.cols} gap-${kgrid.gap} py-1`}
                >
                  {group.map((cardObj, cardIndex) =>
                    renderCardContent(cardObj, cardIndex)
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* 分页指示器 */}

          <SwiperPage totalPages={groupedData.length} />
        </div>
      </PermissionButton>

      {/* 新增项目弹窗 */}
      <FlowListPopup
        open={newProjectModal}
        setOpen={setNewProjectModal}
        queryFlowIdFun={queryFlowIdFun}
      />
    </>
  );
};

export default SwiperGridDemo;
