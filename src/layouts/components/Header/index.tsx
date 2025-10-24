import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Personnel from "@/assets/permissiontion/personnel.png";
import {
  SmartOptimization,
  CircleFiveLine,
  DocumentFolder,
  Worker,
  Bookshelf,
  System,
  Search,
  GridThree,
  Remind,
  Workbench,
  ListView,
  Peoples,
  BranchOne,
  Down,
  Logout,
  Layers,
  Key,
  ListTwo,
  LayoutFour,
  Log,
} from '@icon-park/react';
import PasswordChangeDialog from "../ChangePassword";
import {
  RiSearch2Line,
  RiTranslate,
  RiNotificationLine,
} from "@remixicon/react";
import { Divider, Dropdown, Input, message,Tooltip } from 'antd';
import type { MenuProps } from "antd";
import xiaoxinlogo from '@/assets/images/xiaoxingnew.png';
import { useCustomNavigate } from '@/hooks/use-custom-navigate';
import { useMenuStore } from '@/stores/menuStore';
import { debounce } from 'lodash';
import PermissionButton from "@/components/PermissionButton";
// import { getCurrUserMessageNoReadCount } from "@/controllers/API/queries/notice"
/**
 * 页面头部组件
 * 包含导航菜单、用户信息和登录状态
 */
const getLocalStorageItem = (key: string) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`解析 localStorage 数据 "${key}" 失败`, e);
    return null;
  }
};
const iconMap = {
  SmartOptimization,
  CircleFiveLine,
  DocumentFolder,
  Worker,
  Bookshelf,
  System,
  Search,
  GridThree,
  Remind,
  Workbench,
  ListView,
  Peoples,
  BranchOne,
  Down,
  Logout,
  Layers,
  Key,
  ListTwo,
  LayoutFour,
};
const IconComponent = (more, icon, path?, currentPath?) => {
  const Icon = path === '更多应用' ? icon : iconMap[icon] || null;
  return Icon ? (
    more ? (
      <Icon style={{ fontSize: 22 }} />
    ) : (
      <Icon
        style={{
          width: '16px',
          height: '16px',
          // color: currentPath === path ? '#002FA7' : '#ffffff'
        }}
        className={`group-hover:text-[#002FA7] ${currentPath === path ? 'text-[#002FA7]' : 'text-[#ffffff]'}`}
      />
    )
  ) : null;
};
export default function AppHeader(): JSX.Element {
  // const logout = useAuthStore((state) => state.logout);
  const navigate = useCustomNavigate();
  // const wujieNavigate = useWujieNavigate(`assistant_bus_event`);
  const [activeState, setActiveState] = useState<"notifications" | null>(null);
  const [activeStateA, setActiveStateA] = useState<"notificationsA" | null>(
    null
  );
  const lastPath = window.location.pathname.split("/").filter(Boolean).pop();
  const notificationRef = useRef<HTMLButtonElement | null>(null);
  const notificationContentRef = useRef<HTMLDivElement | null>(null);
  const notificationRefA = useRef<HTMLButtonElement | null>(null);
  const notificationContentRefA = useRef<HTMLDivElement | null>(null);
  const [noticeNum, setNoticeNum] = useState<number>(0)
  const [notcieModalOpen, setNotcieModalOpen] = useState<boolean>(false)
  const [logVisible, setLogVisible] = useState<boolean>(false)
  // useTheme();
  const handleLogout = () => {
    // logout()
  }

  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  // const selectFolderId = useFolderStore((state) => state.selectFolderId)
  const changePassword = () => {
    setPasswordDialogVisible(true);
  }
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // 添加搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <PermissionButton permission="toolbar:notice:content"><div className="flex items-center w-[88px]" onClick={changePassword}>
        <Key theme="outline" size="16" fill="#8D97A3" />
        <div className="ml-[10px] text-[#092C4D] text-[12px]">修改密码</div></div></PermissionButton>

      ,
    }, {
      key: "2",
      label: <div className="flex items-center w-[88px]" onClick={handleLogout}>
        <Logout theme="outline" size="16" fill="#8D97A3" />
        <div className="ml-[10px] text-[#092C4D] text-[12px]">退出登录</div></div>,
    }
  ];

  const toBackstageManagement = () => {
    // window.open(
    //   `${getBackendManagement_URL()}`,
    //   "_blank"
    // );
  }

  // const isToBack = window.localStorage.getItem('isToBack');
  // const [menuList, setMenuList] = useState([]);
  // useEffect(() => {
  //   authMenu()
  // }, [])

  // const authMenu = async () => {
  //   // 获取权限菜单
  //   const { data: res } = await getAuthMenu()
  //   if (res.code == 200) {
  //     localStorage.setItem('isToBack', res.data.length > 0 ? 'true' : 'false');
  //     setMenuList(res.data)
  //   }
  // }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isNotificationButton = notificationRef.current?.contains(target);
      const isNotificationContent =
        notificationContentRef.current?.contains(target);

      if (!isNotificationButton && !isNotificationContent) {
        setActiveState(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     const target = event.target as Node;
  //     const isNotificationButton = notificationRefA.current?.contains(target);
  //     const isNotificationContent =
  //       notificationContentRefA.current?.contains(target);

  //     if (!isNotificationButton && !isNotificationContent) {
  //       setActiveStateA(null);
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // useResetDismissUpdateAll();

  const iconMap = {
    SmartOptimization,
    CircleFiveLine,
    DocumentFolder,
    Worker,
    Bookshelf,
    System,
    Search,
    GridThree,
    Remind,
    Workbench,
    ListView,
    Peoples,
    BranchOne,
    Down,
    Logout,
    Layers,
    Key,
    ListTwo,
    LayoutFour
  };
  const IconComponent = (more, icon, path?, currentPath?) => {
    const Icon = path === '更多应用' ? icon : iconMap[icon] || null;
    return Icon ? more ? <Icon style={{ fontSize: 22 }} /> : <Icon
      style={{
        width: '16px',
        height: '16px',
        // color: currentPath === path ? '#002FA7' : '#ffffff'
      }}
      className={`group-hover:text-[#002FA7] ${currentPath === path ? 'text-[#002FA7]' : 'text-[#ffffff]'}`}
    /> : null;
  };

  const { isAdmin, menuData, defaultTags, extraTagsData, isFrontendMenu, recentlUsedData, fetchMenuData, queryAdmin, getRecentlUsed, saveRecentlyUsed } = useMenuStore();
  const location = useLocation();
  useEffect(() => {
    if (menuData.length === 0) {
      // 初始化加载菜单数据
      fetchMenuData();
      queryAdmin();
    }
  }, [location.pathname]);

  useEffect(() => {
    getRecentlUsed();
  },[])


  useEffect(() => {
    if (menuData.length > 0) {
      let path = location.pathname;
      if(path.includes('xiaoxing') && menuData.some(item => !item.path.includes('xiaoxing'))){
        // path = menuData[0].path
        navigate(menuData[0].path)
      }

      // 1. 尝试匹配当前路径对应的菜单项
      const matchedTag = [...extraTagsData, ...defaultTags].find(tag =>
        path.startsWith(tag.path) ||
        new RegExp(tag.path.replace(/\//g, '\\/')).test(path)
      );

      // 2. 设置可见标签（保留默认标签，最后一个位置可替换）
      let newVisibleTags = [...defaultTags];
      if (matchedTag && !newVisibleTags.some(t => t.path === matchedTag.path)) {
        newVisibleTags[newVisibleTags.length - 1] = matchedTag;
      }
      setVisibleTags(newVisibleTags);

      // 3. 特殊路径处理
      if (
        /\/all\/folder\/\d{18}$/.test(path) ||
        /^\/flows$/.test(path) ||
        /\/flow\/\d+\/folder\/\d+/.test(path)
      ) {
        setCurrentPath('/flows');
      }
      // 4. 知识库相关路径
      else if (path.includes('rag')) {
        setCurrentPath('/rag/knowledge');
      }
      // 5. 小星相关路径
      else if (path.includes('xiaoxing') ||
        path.includes('chat/all') ||
        path.includes('/flowChat')) {
        setCurrentPath('/navigation/xiaoxing');
      }
      // 6. 助理相关路径
      else if (path.includes('assistant')) {
        setCurrentPath(path.includes('assistant/aideChat/') ?
          '/navigation/xiaoxing' :
          '/assistant/');
      } else if (path.includes('square')) {
        setCurrentPath('/square');
      }
      else if (menuData.some(item => path.includes(item.path))) {
        const menu: any = menuData.find(item => path.includes(item.path));
        setCurrentPath(menu.path);
      }
      // 7. 默认选中第一个菜单项
      else {
        const firstMenuPath = defaultTags[0]?.path || '/';
        setCurrentPath(firstMenuPath);

        // 如果当前是根路径，自动跳转到第一个菜单
        if (path === '/') {
          navigate(firstMenuPath);
        }
      }
    }
  }, [location.pathname, menuData]);

  // useEffect(() => {
  //   !isFrontendMenu && navigate("/forbidden")
  // }, [isFrontendMenu]);

  const getInitCurrentPath = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') {
      // 如果是根路径，默认使用第一个菜单项
      return defaultTags[0]?.path || '/navigation/xiaoxing';
    }
    return currentPath;
  }

  const moreTag = { path: '更多应用', name: '更多应用', icon: System, id: '更多应用' };
  const [currentPath, setCurrentPath] = useState<string>(getInitCurrentPath())
  const [visibleTags, setVisibleTags] = useState([...defaultTags]);
  const [showMore, setShowMore] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const moreContentRef = useRef<HTMLDivElement>(null);
  let moreTimer: NodeJS.Timeout | null = null;
  // 鼠标移入“更多应用”按钮
  const handleMoreMouseEnter = () => {
    if (moreTimer) clearTimeout(moreTimer);
    setShowMore(true);
  };
  // 鼠标移出“更多应用”按钮
  const handleMoreMouseLeave = () => {
    moreTimer = setTimeout(() => {
      setShowMore(false);
      setSearchKeyword(''); // 清空搜索关键词
    }, 100); // 延迟关闭，避免抖动
  };
  // 鼠标移入弹窗内容
  const handleMoreContentMouseEnter = () => {
    if (moreTimer) clearTimeout(moreTimer);
    setShowMore(true);
  };
  // 鼠标移出弹窗内容
  const handleMoreContentMouseLeave = () => {
    moreTimer = setTimeout(() => {
      setShowMore(false);
      setSearchKeyword(''); // 清空搜索关键词
    }, 100); // 延迟关闭，避免抖动
  };

  const handleTagClick = useCallback(
    (item) => (e) => {
      saveRecentlyUsed(item.code);

      setCurrentPath(item.path);
      if (item.name == '工作流') {
        // navigate(`/all/folder/${selectFolderId}`);
        // wujieNavigate(`/all/folder/${selectFolderId}`)
        navigate(`/xingflow/flows`)
      }
      else if (item.path !== "更多应用") {
        // navigate(item.path);
        navigate(item.path);
      }
      // 判断是否为 xiaoxing 相关 iframe 页面
      setShowMore(false);
      setSearchKeyword(''); // 清空搜索关键词
    }, []
  );

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowMore((prev) => {
      const newValue = !prev;
      // 当关闭弹窗时清空搜索关键词
      if (!newValue) {
        setSearchKeyword('');
      }
      return newValue;
    });
  };

  const handleExtraTagClick = (item) => {
    saveRecentlyUsed(item.code);

    if (item.name == '工作流') {
      // navigate(`/all/folder/${selectFolderId}`);
      // wujieNavigate(`/all/folder/${selectFolderId}`);
      navigate(`/xingflow/flows`)
    }
    else {
      // navigate(item.path);
      navigate(item.path);
    }
    setShowMore(false);
  };
  const blurSearch = () => {
    // setSearchInputWidth(0)
  }

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  }

  //获取未读消息
  const getMessageNoReadCount = async () => {
    // const { data: res } = await getCurrUserMessageNoReadCount()
    // setNoticeNum(res.data)
  }
  //关闭弹窗
  const closeNotcieModal = () => {
    setNotcieModalOpen(false)
  }
  //刷新未读
  const refreshNoticeNum = debounce(getMessageNoReadCount, 1000)
  const timerRef = useRef<NodeJS.Timeout>(); // 持久化定时器
  useEffect(() => {
    if (!notcieModalOpen) {
      getMessageNoReadCount(); //先调用一次
      timerRef.current = setInterval(() => {
        getMessageNoReadCount();
      }, 30000);
    }
    // 清理函数（组件卸载或依赖变化时执行）
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [notcieModalOpen]);

  const getLocalStorageItem = (key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`解析 localStorage 数据 "${key}" 失败`, e);
      return null;
    }
  };

  const linkHref = getLocalStorageItem('xiaoxingHref');
  const linkTitle = getLocalStorageItem('xiaoxingTitle');

  const [platformTitle, setPlatformTitle] = useState(linkTitle?.title || "数智小星AI");
  const [showLogo, setShowLogo] = useState(linkHref ? linkHref.logo !== 'none' : true);
  const [platformLogo, setPlatformLogo] = useState(linkHref?.logo || xiaoxinlogo);

  // 计算是否需要显示"更多应用"按钮
  const shouldShowMoreTag = [...defaultTags, ...extraTagsData].length > 4;

  // 根据搜索关键词过滤最近使用和全部应用的数据
  const filteredRecentlUsedData = recentlUsedData.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const filteredMenuData = menuData.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 检查是否有搜索结果
  const hasSearchResults = filteredRecentlUsedData.length > 0 || filteredMenuData.length > 0;

  return (
    <div
      // className="flex h-[62px] w-full items-center justify-between gap-2 border-b px-5 py-2.5 dark:bg-background"
      // pl-5 pr-4 py-2.5
      className="flex h-[55px] w-full items-center justify-between gap-2 border-b bg-[#002FA7]"
      data-testid="app-header"
    >
      {/* Left Section */}
      <div
        className={`flex items-center gap-2 pl-5 py-2.5 w-[305px]`}
        data-testid="header_left_section_wrapper"
      >
        {/* onClick={() => navigate("/")} */}
        <div
          className="mr-1 flex h-[32px] w-[160px] items-center"
          data-testid="icon-ChevronLeft"
        >
          {/* {ENABLE_DATASTAX_LANGFLOW ? (
            <DataStaxLogo className="fill-black dark:fill-[white]" />
          ) : ( */}
            <div className="flex items-center" onClick={() => navigate("/navigation/xiaoxing")}>
              {showLogo && <img
                src={platformLogo}
                className="h-[31px] w-[40px] shrink-0 focus-visible:outline-0"
              />}
              <div className="text-white text-[18px] text-left ml-2 font-bold ">
                {platformTitle}
              </div>
            </div>
          {/* )} */}
        </div>
      </div>
       <div className={`flex items-center h-[34px] gap-[10px] `}>
          {[...visibleTags, ...(shouldShowMoreTag ? [moreTag] : [])].map((item) => (
            <div
              key={item.path}
              className={`relative flex items-center justify-center h-full ${currentPath === item.path
                ? 'bg-white rounded-[6px]'
                : ''
                } group hover:bg-white hover:rounded-[6px]`}
              onClick={item.path === '更多应用' ? handleMoreClick : handleTagClick(item)}
              onMouseEnter={item.path === '更多应用' ? handleMoreMouseEnter : undefined}
              onMouseLeave={item.path === '更多应用' ? handleMoreMouseLeave : undefined}
              style={{
                cursor: 'pointer',
                padding: '0 10px'
              }}
            >
              <div className={`flex items-center whitespace-nowrap`}>
                <span
                  className="flex items-center justify-center group-hover:text-[#002FA7]"
                  style={{
                    width: '18px',
                    height: '18px',
                  }}
                >
                  {IconComponent(false, item.icon, item.path, currentPath)}
                </span>
                <span
                  style={{
                    marginLeft: '6px',
                    lineHeight: '20px',
                    // color: currentPath === item.path ? '#002FA7' : '#ffffff',
                    fontSize: '14px',
                    textAlign: 'left',
                    fontFamily: 'PingFangSC-medium'
                  }}
                  className={`group-hover:text-[#002FA7] ${currentPath === item.path ? 'text-[#002FA7]' : 'text-[#ffffff]'}`}
                >
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      {shouldShowMoreTag && showMore && (
        <div
          ref={moreContentRef}
          style={{
            position: 'absolute',
            top: 55,
            right: 0,
            left: 0,
            margin: 'auto',
            // height: 'center',
            maxHeight: 480,
            minHeight: 119,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 8,
            padding: '10px 30px 40px 20px',
            zIndex: 1000,
            minWidth: 240,
            maxWidth: 840,
            // display: 'flex',
            // flexWrap: 'wrap',
            gap: 16,
          }}
          className='overflow-y-hidden flex flex-col'
          onMouseEnter={handleMoreContentMouseEnter}
          onMouseLeave={handleMoreContentMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='w-60 mb-2.5'>
            <Input
              width="240px"
              onBlur={() => blurSearch()}
              placeholder="请输入搜索内容"
              value={searchKeyword}
              onChange={handleSearchChange}
              autoFocus
            />
          </div>
          <div className='overflow-y-auto min-h-0 flex-1'>
          {/* 当有搜索关键词且没有搜索结果时显示 */}
          {searchKeyword && !hasSearchResults && (
            <div className='text-center py-5 text-gray-500'>
              未找到匹配的应用
            </div>
          )}

          {/* 只有在没有搜索关键词或有搜索结果时才显示内容 */}
          {(!searchKeyword || hasSearchResults) && (
            <>
              {/* 只在没有搜索关键词时显示最近使用 */}
              {!searchKeyword && (
                <>
                  <div className='mb-2.5 text-[#092C4D] text-sm font-medium'>
                    最近使用
                  </div>
                  <div className='flex flex-wrap gap-12 gap-y-2'>
                    {filteredRecentlUsedData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center h-[50px] group hover:bg-[#DDE6FAFF] rounded-[6px] pl-1.5"
                        style={{ width: 120, cursor: 'pointer' }}
                        onClick={() => handleExtraTagClick(item)}
                      >
                        <div
                          className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-[#002FA7] text-[14px] text-center border-[1px] border-solid border-[#DFE2E7] group-hover:bg-[#fff] group-hover:border-[#fff]"
                          style={{
                            lineHeight: '20px',
                          }}
                        >
                          {IconComponent(true, item.icon)}
                        </div>
                        <div
                          className="ml-2.5 text-[#5A6875] text-[12px] leading-[20px] flex items-center"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                          }}
                          title={item.name}
                        >
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Divider></Divider>
                </>
              )}

              <div className='mb-2.5 text-[#092C4D] text-sm font-medium'>
                {searchKeyword ? '搜索结果' : '全部应用'}
              </div>
              <div className='flex flex-wrap gap-x-12 gap-y-1.5'>
                {filteredMenuData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center h-[50px] group hover:bg-[#DDE6FAFF] rounded-[6px] pl-1.5"
                    style={{ width: 119, cursor: 'pointer' }}
                    onClick={() => handleExtraTagClick(item)}
                  >
                    <div
                      className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-[#002FA7] text-[14px] text-center border-[1px] border-solid border-[#DFE2E7] group-hover:bg-[#fff] group-hover:border-[#fff]"
                      style={{
                        lineHeight: '20px',
                      }}
                    >
                      {IconComponent(true, item.icon)}
                    </div>
                    <div
                      className="ml-2.5 text-[#5A6875] text-[12px] leading-[20px] flex items-center"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>

        </div>
      )}
      {/* Middle Section */}
      {/* <div className="w-full flex-1 truncate md:max-w-[57%] lg:absolute lg:left-1/2 lg:max-w-[43%] lg:-translate-x-1/2 xl:max-w-[31%]">
        <FlowMenu />
      </div> */}


      {/* Right Section */}
      <div
        className={`flex items-center justify-end gap-5 w-[305px]`}
        data-testid="header_right_section_wrapper"
      >
        <PermissionButton permission="toolbar:log:list">
          {isFrontendMenu && <Tooltip title="操作日志" placement="bottom">
            <Log
              className="cursor-pointer"
              theme="outline" size="20" fill="rgba(255,255,255,1)"
              onClick={() => setLogVisible(true)} />
          </Tooltip>}
        </PermissionButton>

        <PermissionButton permission="toolbar:enter:backend">
          {isAdmin && <Tooltip title="进入后台管理系统" placement="bottom">
            <Workbench
              className="cursor-pointer"
              theme="outline"
              size="20"
              fill="rgba(255,255,255,1)"
              onClick={toBackstageManagement}
            />
          </Tooltip>}
        </PermissionButton>
        {/* {notcieModalOpen && <Notice notcieModalOpen={notcieModalOpen} closeNotcieModal={closeNotcieModal} refreshNoticeNum={refreshNoticeNum}></Notice>} */}

        {/* <LogModal visible={logVisible}
          onClose={() => setLogVisible(false)}></LogModal> */}
        <PermissionButton permission="toolbar:notice:content">
          {isFrontendMenu && <Tooltip title="消息通知" placement="bottom"><div className="relative" onClick={() => { setNotcieModalOpen(true) }}>
            <RiNotificationLine className="cursor-pointer" size={20} color="rgba(255,255,255,1)" />
            {noticeNum > 0 && <div className='absolute bg-[#F8544B] text-[white] text-[10px] px-[4px]
          rounded-[200px] h-[14px] leading-[14px] -right-[7px] -top-[3px]'>{noticeNum > 99 ? "99+" : noticeNum}</div>}
          </div></Tooltip>}
        </PermissionButton>
        <div className="flex py-2.5 mr-[15px] items-center">
          <Dropdown menu={{ items }} placement="bottomLeft" arrow>
            <div className="flex items-center">
              <img className="h-[32px] w-[32px]" src={Personnel} />
              {userInfo?.realName && <><div className="text-[12px] text-white ml-[6px] text-[500] max-w-[80px] truncate mr-[4px]" style={{ fontWeight: 500 }}>{userInfo?.realName}</div>
                <Down theme="outline" size="14" fill="#8D97A3" /></>}
            </div>
          </Dropdown>
        </div>
      </div>


       {/* 密码修改弹窗 */}
      <PasswordChangeDialog
        visible={passwordDialogVisible}
        onClose={() => setPasswordDialogVisible(false)}
      />
    </div>
  );
}
