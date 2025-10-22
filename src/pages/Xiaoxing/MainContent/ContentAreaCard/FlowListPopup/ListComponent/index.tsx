import { useDebounce } from "@/hooks/use-debounce";
// import useDragStart from "@/components/core/cardComponent/hooks/use-on-drag-start";
// import { Card } from "@/components/ui/card";
// import { swatchColors } from "@/utils/styleUtils";
import { cn, getNumberFromString } from "@/utils/utils";
import riFillshape from "@/assets/riFill-shape-fill.png";
import kefurexian from "@/assets/images/kefu.png";
import moment from "moment";
import { message } from "antd";
import { addGetCollect } from "@/api/shuzhixiaoxing/use-get-messages";
import TsImg from "@/components/TsImg";
import { useNavigate } from "react-router-dom";

const ListComponent = ({ flowData, closeSetOpen, activeKey }) => {
  const isComponent = flowData.is_component ?? false;
  const navigate = useNavigate();

  // 创建防抖后的点击处理函数
  const handleClick = async (flowData) => {
    if (!isComponent) {
      const { id } = flowData;
      let types = activeKey == "1" ? "助理" : "工作流";
      await addGetCollect({ flow_id: id, types })
        .then((res) => {
          if (res?.data?.detail == '应用已存在，添加失败！') {
            message.error(res?.data?.detail);
            return
          }
          if (res.data) {
            message.success("添加成功");
            closeSetOpen(flowData.id);

            const routeKey =
              activeKey === "1"
                ? `/assistant/aideChat/${flowData.id}`
                : `/xingflow/flowChat/${flowData.id}`;
            navigate(routeKey);
          }
        })
        .catch((error) => {
          const { detail } = error.response.data;
          // message.error('应用已存在, 添加失败 ！');
          message.error(flowData?.name + detail);
        });
    }
  };

  // const debouncedHandleClick = useDebounce(handleClick, 300);

  // const { onDragStart } = useDragStart(flowData);

  return (
    <>
      <div
        key={flowData.id}
        draggable
        // onDragStart={onDragStart}
        // onClick={() => debouncedHandleClick(flowData)}
        className={`my-2 flex flex-row bg-background ${
          isComponent ? "cursor-default" : "cursor-pointer"

        } group justify-between rounded-lg px-5 py-[19px]   hover:outline outline-[1px] hover:outline-[#002FA7] hover:shadow-[0px_1px_6px_0px_rgba(227,236,251,1)] bg-white`}
        data-testid="list-card"
      >
        <div
          className={`flex w-full  rounded-[10px]${
            isComponent ? "cursor-default" : "cursor-pointer"
          } items-center gap-4`}
        >
          <div
            className={cn(
              `items-center flex justify-center rounded-lg border w-[40px] h-[40px]`
              // swatchColors[swatchIndex],
            )}
          >
            {activeKey == "1" ? (
              <TsImg tsImg={kefurexian} tsWid="20px" tsHig="15px" />
            ) : (
              <TsImg tsImg={riFillshape} tsWid="20px" tsHig="20px" />
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-start flex-1">
            <div className="line-clamp-1 flex min-w-0 items-baseline truncate max-md:flex-col">
              <div className="text-sm flex truncate pr-2 font-semibold max-md:w-full">
                <div className="text-[16px] truncate font-semibold group-hover:text-[#002FA7]">
                  {flowData.name}
                </div>
              </div>
              <div className="item-baseline flex text-xs text-muted-foreground pl-5">
                {moment.utc(flowData.updated_at).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
            <div className="overflow-hidden text-sm text-[#092C4D] pt-1">
              <span className="block max-w-[110ch] truncate">
                {flowData?.description || flowData?.desc}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListComponent;
