import { Comments, Delete } from "@icon-park/react";
import kefurexian from "@/assets/images/kefu.png";
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useCollectLeftChat } from "@/api/shuzhixiaoxing/use-collect-left-chat";
import { remove_chat_by_id } from "@/api/shuzhixiaoxing/use-get-messages";
import { Input, message, Popconfirm, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import TsTooltip from "@/components/TsTooltip";
import TsImg from "@/components/TsImg";
import { RiSearchLine } from "@remixicon/react";
import PermissionButton from "@/components/PermissionButton";

interface HistoryItem {
  id: string;
  name: string;
  types: string;
  last_time: string;
  last_msg?: string;
}

interface HistoryGroup {
  date: string;
  list: HistoryItem[];
}

interface LeftHistoryHandles {
  refreshHistory: () => void;
}

const LeftHistory = forwardRef<LeftHistoryHandles>((props, ref) => {
  const { mutate: leftChat } = useCollectLeftChat();
  const [leftData, setLeftData] = useState<HistoryGroup[]>([]);
  const navigate = useNavigate();

  // 防抖函数
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // 查询历史记录
  const queryLeftChat = useCallback(
    debounce((name: string) => {
      leftChat(name, {
        onSuccess: (res: HistoryGroup[]) => {
          setLeftData(res?.length > 0 ? res : []);
        },
        onError: (err) => {
          console.error("查询历史记录失败:", err);
        },
      });
    }, 300),
    [leftChat, debounce]
  );

  // 暴露给父组件的刷新方法
  useImperativeHandle(ref, () => ({
    refreshHistory: () => {
      queryLeftChat("");
    }
  }));

  useEffect(() => {
    queryLeftChat("");
  }, [queryLeftChat]);

  // 删除处理
  const handleConfirm = useCallback(
    async (id: string, types: string) => {
      try {
        const res = await remove_chat_by_id(id, types);
        if (res?.data?.code === 200) {
          message.success(res?.data.msg);
          queryLeftChat("");
        }
      } catch (error) {
        message.error("删除失败");
      }
    },
    [queryLeftChat]
  );

  // 跳转处理
  const handleNavigate = useCallback(
    (item: HistoryItem, e: React.MouseEvent) => {
      e.stopPropagation();
      const routeKey =
        item.types === "助理"
          ? `/assistant/aideChat/${item.id}/editChat`
          : `/xingflow/flowChat/${item.id}/editChat`
          // : `/flowChat/${item.id}/editChat`;
      navigate(routeKey);
    },
    [navigate]
  );

  // 渲染单个历史记录项
  const renderHistoryItem = (item: HistoryItem) => {
    return (
      <div
        key={item.id}
        className="group w-[218px] h-[90px] rounded-[10px] pt-[10px] mb-[10px] border cursor-pointer flex flex-col justify-between hover:border-[#002FA7] transition-colors duration-150"
      >
        <div
          className="flex flex-col h-full"
          onClick={(e) => handleNavigate(item, e)}
        >
          <div className="flex px-[10px]">
            <div className="w-[30px] h-[30px] flex items-center justify-center bg-[#F6F7F8] rounded-[6px]">
              <TsImg tsImg={kefurexian} tsWid="20px" tsHig="15px" />
            </div>
            <div className="flex items-center pl-[10px] justify-between flex-1">
              <div className="w-[80px] flex items-center font-[500] text-sm text-[#092C4D] group-hover:text-[#002FA7]">
                <TsTooltip
                  node={{
                    label: item.name,
                    fontWig: 500,
                  }}
                  tooltipWidth={300}
                  tooltipMaxHeight={150}
                />
              </div>
              <div className="flex items-center">
                <span className="text-[#90A0AF] text-xs pr-[6px]">
                  {item.last_time}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <PermissionButton permission="assistant:conversation:delete">
                    <Popconfirm
                      title={`确定要删除 ${item.name} 吗?`}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleConfirm(item.id, item.types);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Delete
                        theme="outline"
                        size="16"
                        fill="#F8544B"
                        className="cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </PermissionButton>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[14px] text-[#90A0AF] pt-[8px] px-[10px] overflow-hidden whitespace-nowrap text-ellipsis">
            <TsTooltip
              node={{
                label: item.last_msg?.split("_$$$")[0],
              }}
              tooltipWidth={240}
              tooltipMaxHeight={200}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="text-[12px] w-[50px] h-[20px] flex items-center justify-center rounded-tl-[10px] rounded-br-[10px] text-white"
            style={{
              backgroundColor: item.types === "工作流" ? "#00A4EE" : "#1AB081",
            }}
          >
            {item.types}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[250px] bg-white h-full pt-[20px] pl-4">
      <div className="flex items-center">
        <Comments theme="outline" size="18" fill="#8D97A3" />
        <div className="text-[#092C4D] font-semibold text-[16px] pl-[14px]">
          历史记录
        </div>
      </div>
      <Input
        prefix={<RiSearchLine size="18px" color="#8D97A3" />}
        placeholder="请输入搜索内容"
        className="w-[218px] text-[14px] mb-[10px] mt-[15px]"
        onChange={(e) => queryLeftChat(e.target.value)}
        allowClear
      />
      <div className="overflow-y-auto h-[83%] pr-4 custom-scrollbar">
        <div className="pt-[4px]">
          {leftData.length > 0 ? (
            leftData.map((group) => (
              <div key={group.date}>
                <div className="pb-[10px] text-[#90A0AF] text-xs pt-2">
                  {group.date}
                </div>
                {group.list.map((item) => renderHistoryItem(item))}
              </div>
            ))
          ) : (
            <div className="flex justify-center h-full items-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无历史记录"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default LeftHistory;
