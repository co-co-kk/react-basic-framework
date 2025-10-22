// import ForwardedIconComponent from "@/components/common/genericIconComponent";
// import { convertTestName } from "@/components/common/storeCardComponent/utils/convert-test-name";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   // SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarProvider,
//   // SidebarMenuItem,
//   // SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { useIsMobile } from "@/hooks/use-mobile";

// import { cn } from "@/utils/utils";
// import { NavProps } from "../../../../types/templates/types";
import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";

// import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { assistantList,foldersProjects } from "@/api/shuzhixiaoxing/use-get-messages";
import { RiSearchLine } from "@remixicon/react";
import { Input } from "antd";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";

export function Nav({
  categories,
  currentTab,
  setCurrentTab,
  handleSetCurrentTab,
  activeKey,
  tabKey,
}: any) {
  if (activeKey !== tabKey) return null;
  const [searchQuery, setSearchQuery] = useState("");
  // const [filteredExamples, setFilteredExamples] = useState<any>(categories);
  // 模糊 - 查询
  // const filteredCategories: any = useFuzzySearch(filteredExamples, searchQuery);

  const [navData, setNavData] = useState<any>([]);
  let filteredCategories: any = useFuzzySearch(categories, searchQuery);

  useEffect(() => {
    // setFilteredExamples(categories);
    if (activeKey == "1") {
      assistantType("");
    } else {
      getFoldersList('')

    }
  }, [activeKey, open, categories]);

  // 助理分类
  const assistantType = async (e) => {
    debugger
    await assistantList(e)
      .then((res: any) => {
        if (res?.data?.length >= 0) {
          setNavData(res.data);

          // 默认第一个
          let id = res?.data[0]?.id;
          setCurrentTab(id);
          handleSetCurrentTab(id);
        }
      })
      .catch(() => {});
  };
  const getFoldersList = async (name) =>{
    await foldersProjects().then((res)=>{
      setNavData(res.data);
      let id = res.data && res.data[0]?.id;
      handleSetCurrentTab(id);
      setCurrentTab(id);
    })
  }

  // 左侧搜索
  const handleChangeInput = (e) => {
    if (activeKey == "1") {
      assistantType(e);
    } else {
      setSearchQuery(e)
    }
  };

  useEffect(() => {
    if(activeKey == '2' && searchQuery) {
      setNavData(filteredCategories);
    } else {
      setNavData(categories)
    }
  }, [searchQuery,activeKey ])

  return (
    <>
    <div className="h-full">
 <Input
            prefix={<RiSearchLine size="18px" color="#8D97A3" />}
            placeholder="请输入"
            className="w-[160px] mx-2.5 mt-2"
            onChange={(e) => (
              setSearchQuery(e.target.value), handleChangeInput(e.target.value)
            )}
            value={searchQuery}
          />
           <div className="pl-[22px] pt-2 text-[#092C4D] font-semibold text-sm">
            我的分类
          </div>
          <div className="h-[calc(100%-80px)] overflow-y-auto px-4 w-[calc(100%-16px)]">


    {navData?.map((link, index) => (
                 <div
                      onClick={() => (
                        handleSetCurrentTab(link.id), setCurrentTab(link.id)
                      )}
                      // isActive={currentTab === link.id}
                      // data-testid={`side_nav_options_${link.title.toLowerCase().replace(/\s+/g, "-")}`}
                      // tooltip={link.name}
                      className={`h-[40px] px-2 py-0 ${
                        currentTab === link.id
                          ? "text-selected bg-[#e3ecfb] text-[#002fa7] rounded-[6px]"
                          : "text-muted-foreground text-[#092C4D] font-semibold"
                      } hover:text-selected hover:bg-[#e3ecfb] hover:text-[#002fa7] hover:rounded-[6px] flex items-center my-2 cursor-pointer`}
                    >
                      <span
                        className="text-sm line-clamp-1 truncate"
                        title={link.name}
                        // data-testid={`category_title_${convertTestName(link.title)}`}
                      >
                        {link.name}
                      </span>
                    </div>
            ))}
            </div>
    </div>

    </>
  );
}
