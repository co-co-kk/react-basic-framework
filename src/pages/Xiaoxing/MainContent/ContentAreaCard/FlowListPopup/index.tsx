import { useEffect, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Nav } from "./navComponent";
import ListComponent from "./ListComponent";
import { Empty, Input, Modal, Tabs } from "antd";
// import { Input } from "@/components/ui/input";

// import { useGetFoldersQuery } from "@/controllers/API/queries/folders/use-get-folders";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import {
  list_by_type_id,
  foldersList,
  foldersProjects,
} from "@/api/shuzhixiaoxing/use-get-messages";
import { RiSearchLine } from "@remixicon/react";
// import { getNewFlowURL } from "@/controllers/API/helpers/constants";
// import { api } from "@/controllers/API/api";

export default function FlowTemplatesModal({
  open,
  setOpen,
  queryFlowIdFun,
}: any): JSX.Element {
  const [currentTab, setCurrentTab] = useState("1");

  const [flowId, setFlowId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeKey, setActiveKey] = useState("1");
  const [listData, setListData] = useState([]);
  const [categories, setCategories] = useState([]);

  // 左侧数据
  // const { data: categories, isFetched: isFoldersFetched } =
  //   useGetFoldersQuery();

  //左侧数据
  const categoriesFun = async () => {
    // const res = await api.get(`${getNewFlowURL("FOLDERS")}/`);
    // setCategories(res.data || [])
  }

  useEffect(() => {
    if (open) {
      categoriesFun();
    }
  }, [open]);

  //点击分类请求 右侧流程数据
  const handleSetCurrentTab = async (id: string) => {
    if (!id) return;
    setFlowId(id);
    try {
      let response;
      if (id && activeKey === "1") {
        response = await list_by_type_id(id); //助理
        setListData(response?.data || []);
      } else {
        response = await foldersList(id, ""); //工作流
        let flowItems = response?.data?.flows?.items || [];
        let permissions = response?.data?.permissions || {};

        setListData(flowItems?.filter((item) => item.id in permissions));
      }
    } catch (error) {
      // 统一错误处理
      console.error("获取数据失败:", error);
      setListData([]);
    }
  };

  const filteredCategories: any = useFuzzySearch(listData, searchQuery);

  //关闭弹窗
  const closeSetOpen: any = (flowId) => {
    if (flowId) {
      queryFlowIdFun(flowId);
    }
    setOpen(false);
  };

  //
  const tabsItems = [
    {
      key: "1",
      label: "助理",
    },
    {
      key: "2",
      label: "工作流",
    },
  ];

  // tabs 自定义组件
  const antdTabItems = tabsItems.map((item) => ({
    key: item.key,
    label: item.label,
    children: (
      <div className="w-full pt-3 h-[calc(600px-90px)] flex" key={item.key}>
        <div className="w-[180px] bg-[#fff] h-full rounded-bl-[10px] border-r-[1px] border-[#eaeaea]">
          <Nav
            categories={categories}
            currentTab={currentTab}
            activeKey={activeKey}
            setCurrentTab={setCurrentTab}
            handleSetCurrentTab={handleSetCurrentTab}
            open={open}
            tabKey={item.key}
          />
        </div>
        <div className="bg-[#F8FBFF] h-full pr-5 pl-2.5 max-w-[820px] w-full rounded-br-[10px]">
          <Input
            prefix={<RiSearchLine size="18px" color="#8D97A3" />}
            placeholder="请输入"
            className="w-[200px]"
            onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          />
          <div className="overflow-y-auto h-[445px] scrollbar-hide px-2">
            {filteredCategories?.length > 0 ? (
              <>
                {filteredCategories?.map((flow, index) => (
                  <ListComponent
                    key={index}
                    flowData={flow}
                    activeKey={activeKey}
                    closeSetOpen={closeSetOpen}
                  />
                ))}
              </>
            ) : (
              <div className="flex text-xs justify-center items-center h-full text-[#90A0AF]">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <>
      <Modal
        title=""
        open={open}
        centered={true}
        closable={false}
        width={1000}
        footer={null}
        styles={{
          content: {
            padding: 0,
          },
        }}
      >
        <div className="h-[600px]">
          <header className="w-full flex justify-between h-[50px] items-center px-4 border-b-[1px] border-b-[#EFEFEF]">
            <div className="text-[16px] text-[#092C4D] font-semibold">
              选择应用
            </div>
            <CloseOutlined
              style={{ color: "rgba(141,151,163,1)" }}
              onClick={() => closeSetOpen()}
            />
          </header>
          <div className="h-[calc(600px-50px)] bg-[#F8FBFF] rounded-b-[10px]">
            <Tabs
              defaultActiveKey={activeKey}
              items={antdTabItems}
              className="ts-ant-tabs-nav ts-ant-tabs-nav-text"
              onTabClick={(e) => setActiveKey(e)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
