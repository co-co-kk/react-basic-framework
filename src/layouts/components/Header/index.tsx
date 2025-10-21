import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
} from '@icon-park/react';
import { Divider, Dropdown, Input, message } from 'antd';

import xiaoxinlogo from '@/assets/images/xiaoxingnew.png';
import { useCustomNavigate } from '@/hooks/use-custom-navigate';
import { useMenuStore } from '@/stores/menuStore';
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
export default function Header() {
  const navigate = useCustomNavigate();
  const {
    isAdmin,
    menuData,
    defaultTags,
    extraTagsData,
    isFrontendMenu,
    recentlUsedData,
    fetchMenuData,
    queryAdmin,
    getRecentlUsed,
    saveRecentlyUsed,
  } = useMenuStore();
  const linkHref = getLocalStorageItem('xiaoxingHref');
  const [platformLogo, setPlatformLogo] = useState(linkHref?.logo || xiaoxinlogo);
  const [showLogo, setShowLogo] = useState(linkHref ? linkHref.logo !== 'none' : true);
  // 计算是否需要显示"更多应用"按钮
  const shouldShowMoreTag = [...defaultTags, ...extraTagsData].length > 4;

  // queryAdmin

  const location = useLocation();
  useEffect(() => {
    if (menuData.length === 0) {
      // 初始化加载菜单数据
      fetchMenuData();
      queryAdmin();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (menuData.length > 0) {
      const path = location.pathname;
      if (path.includes('xiaoxing') && menuData.some((item) => !item.path.includes('xiaoxing'))) {
        // path = menuData[0].path
        navigate(menuData[0].path);
      }

      // 1. 尝试匹配当前路径对应的菜单项
      const matchedTag = [...extraTagsData, ...defaultTags].find(
        (tag) => path.startsWith(tag.path) || new RegExp(tag.path.replace(/\//g, '\\/')).test(path),
      );

      // 2. 设置可见标签（保留默认标签，最后一个位置可替换）
      const newVisibleTags = [...defaultTags];
      if (matchedTag && !newVisibleTags.some((t) => t.path === matchedTag.path)) {
        newVisibleTags[newVisibleTags.length - 1] = matchedTag;
      }
      setVisibleTags(newVisibleTags);

      // 3. 特殊路径处理
      if (/\/all\/folder\/\d{18}$/.test(path) || /^\/flows$/.test(path) || /\/flow\/\d+\/folder\/\d+/.test(path)) {
        setCurrentPath('/flows');
      }
      // 4. 知识库相关路径
      else if (path.includes('rag')) {
        setCurrentPath('/rag/knowledge');
      }
      // 5. 小星相关路径
      else if (path.includes('xiaoxing') || path.includes('chat/all') || path.includes('/flowChat')) {
        setCurrentPath('/navigation/xiaoxing');
      }
      // 6. 助理相关路径
      else if (path.includes('assistant')) {
        setCurrentPath(path.includes('assistant/aideChat/') ? '/navigation/xiaoxing' : '/assistant/');
      } else if (path.includes('square')) {
        setCurrentPath('/square');
      } else if (menuData.some((item) => path.includes(item.path))) {
        const menu: any = menuData.find((item) => path.includes(item.path));
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

  const getInitCurrentPath = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') {
      // 如果是根路径，默认使用第一个菜单项
      return defaultTags[0]?.path || '/navigation/xiaoxing';
    }
    return currentPath;
  };
  const linkTitle = getLocalStorageItem('xiaoxingTitle');
  const [platformTitle, setPlatformTitle] = useState(linkTitle?.title || '数智小星AI');
  const moreTag = { path: '更多应用', name: '更多应用', icon: System, id: '更多应用' };
  const [currentPath, setCurrentPath] = useState<string>(getInitCurrentPath());
  const [visibleTags, setVisibleTags] = useState([...defaultTags]);
  const [showMore, setShowMore] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const moreContentRef = useRef<HTMLDivElement>(null);
  let moreTimer: NodeJS.Timeout | null = null;

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowMore((prev) => !prev);
  };
  const handleTagClick = useCallback(
    (item) => (e) => {
      saveRecentlyUsed(item.code);

      setCurrentPath(item.path);
      if (item.name == '工作流') {
        // wujieNavigate(`/all/folder/${selectFolderId}`)
        navigate(`/xingflow/flows`);
      } else if (item.path !== '更多应用') {
        // navigate(item.path);
        navigate(item.path);
      }
      // 判断是否为 xiaoxing 相关 iframe 页面
      setShowMore(false);
    },
    [],
  );
  // 鼠标移入“更多应用”按钮
  const handleMoreMouseEnter = () => {
    if (moreTimer) clearTimeout(moreTimer);
    setShowMore(true);
  };
  // 鼠标移出“更多应用”按钮
  const handleMoreMouseLeave = () => {
    moreTimer = setTimeout(() => {
      setShowMore(false);
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
    }, 100); // 延迟关闭，避免抖动
  };

  const handleExtraTagClick = (item) => {
    saveRecentlyUsed(item.code);

    if (item.name == '工作流') {
      // navigate(`/all/folder/${selectFolderId}`);
      // wujieNavigate(`/all/folder/${selectFolderId}`);
      // wujieNavigate(`/xingflow/flows`)
      navigate(`/xingflow/flows`);
    } else {
      navigate(item.path);
      // wujieNavigate(item.path);
    }
    setShowMore(false);
  };

  return (
    <div
      // className="flex h-[62px] w-full items-center justify-between gap-2 border-b px-5 py-2.5 dark:bg-background"
      // pl-5 pr-4 py-2.5
      className="flex h-[55px] w-full items-center justify-between gap-2 border-b bg-[#002FA7]"
      data-testid="app-header"
    >
      {/* Left Section */}
      <div className={`flex items-center h-full w-[305px] pl-[20px]`} data-testid="header_left_section_wrapper">
        {/* onClick={() => navigate("/")} */}
        <div className="flex h-[32px] w-[160px] items-center">
          <div
            className="flex items-center"
            // onClick={() => navigate("/navigation/xiaoxing")}
          >
            {showLogo && <img src={platformLogo} className="h-[31px] w-[40px] shrink-0 focus-visible:outline-0" />}
            <div className="ml-[8px] text-[#fff] text-[18px] text-left font-[600]">{platformTitle}</div>
          </div>
        </div>
      </div>
      <div className={`flex items-center h-[34px] gap-[10px] `}>
        {[...visibleTags, ...(shouldShowMoreTag ? [moreTag] : [])].map((item) => (
          <div
            key={item.path}
            className={`relative flex items-center justify-center h-full ${
              currentPath === item.path ? 'bg-white rounded-[6px]' : ''
            } group hover:bg-[#fff] hover:rounded-[6px]`}
            onClick={item.path === '更多应用' ? handleMoreClick : handleTagClick(item)}
            onMouseEnter={item.path === '更多应用' ? handleMoreMouseEnter : undefined}
            onMouseLeave={item.path === '更多应用' ? handleMoreMouseLeave : undefined}
            style={{
              cursor: 'pointer',
              padding: '0 10px',
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
                  fontFamily: 'PingFangSC-medium',
                }}
                className={`group-hover:text-[#002FA7] ${
                  currentPath === item.path ? 'text-[#002FA7]' : 'text-[#ffffff]'
                }`}
              >
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      {shouldShowMoreTag && !showMore && (
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
          // onMousemove={setShowMore(false)}
          // onMouseout={setShowMore(false)}
          onMouseEnter={handleMoreContentMouseEnter}
          onMouseLeave={handleMoreContentMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-60 mb-2.5">
            <Input
              width="240px"
              // onBlur={() => blurSearch()}
              placeholder="请输入搜索内容"
            />
          </div>
          <div className="mb-2.5 text-[#092C4D] text-sm font-medium">最近使用</div>
          <div className="flex flex-wrap gap-12 gap-y-2">
            {recentlUsedData.map((item) => (
              <div
                key={item.name}
                // className="flex items-center h-[60px] hover:bg-white"
                className="flex items-center h-[50px] group hover:bg-[#DDE6FAFF] rounded-[6px] pl-1.5"
                style={{ width: 120, cursor: 'pointer' }}
                onClick={() => handleExtraTagClick(item)}
              >
                <div
                  className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-[#002FA7] text-[14px] text-center border-[1px] border-solid border-[#DFE2E7] group-hover:bg-[#fff] group-hover:border-[#fff]"
                  // className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-[#002FA7] text-[14px] text-center"
                  style={{
                    lineHeight: '20px',
                    // border: '1px solid #DFE2E7',
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
          <div className="mb-2.5 text-[#092C4D] text-sm font-medium">全部应用</div>
          <div className="flex flex-wrap gap-x-12 gap-y-1.5">
            {menuData.map((item) => (
              <div
                key={item.name}
                // className="flex items-center h-[60px]"
                className="flex items-center h-[50px] group hover:bg-[#DDE6FAFF] rounded-[6px] pl-1.5"
                style={{ width: 119, cursor: 'pointer' }}
                onClick={() => handleExtraTagClick(item)}
              >
                <div
                  // className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-[#002FA7] text-[14px] text-center"
                  className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-[#002FA7] text-[14px] text-center border-[1px] border-solid border-[#DFE2E7] group-hover:bg-[#fff] group-hover:border-[#fff]"
                  style={{
                    lineHeight: '20px',
                    // border: '1px solid #DFE2E7',
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
        </div>
      )}
      {/* Middle Section */}

      {/* <div className="w-full flex-1 truncate md:max-w-[57%] lg:absolute lg:left-1/2 lg:max-w-[43%] lg:-translate-x-1/2 xl:max-w-[31%]">
        <FlowMenu />
      </div> */}

      {/* Right Section */}
      <div className={`flex items-center justify-end gap-5 w-[305px]`} data-testid="header_right_section_wrapper">
        123
        {/* {onFlowPage && currentFlow ? (
          <AlertDropdown
            notificationRef={notificationContentRef}
            onClose={() => setActiveState(null)}
          >
            <ShadTooltip
              content="Notifications and errors"
              side="bottom"
              styleClasses="z-10"
            >
              <AlertDropdown onClose={() => setActiveState(null)}>
                <div>
                  <span
                    className={
                      notificationCenter
                        ? `absolute left-[31px] top-[10px] h-1 w-1 rounded-full bg-destructive`
                        : "hidden"
                    }
                  />
                  <BranchOne
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setActiveState((prev) =>
                        prev === "notifications" ? null : "notifications"
                      )
                    }
                    theme="outline"
                    size="20"
                    fill="rgba(255,255,255,1)"
                  />
                </div>
              </AlertDropdown>
            </ShadTooltip>
          </AlertDropdown>
        ) : (
          <></>
        )}
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

        {notcieModalOpen && <Notice notcieModalOpen={notcieModalOpen} closeNotcieModal={closeNotcieModal} refreshNoticeNum={refreshNoticeNum}></Notice>}

        <LogModal visible={logVisible}
          onClose={() => setLogVisible(false)}></LogModal>
        <PermissionButton permission="toolbar:notice:content">
          {isFrontendMenu && <Tooltip title="消息通知" placement="bottom"><div className="relative" onClick={() => { setNotcieModalOpen(true) }}>
            <RiNotificationLine className="cursor-pointer" size={20} color="rgba(255,255,255,1)" />
            {noticeNum > 0 && <div className='absolute bg-[#F8544B] text-[white] text-[10px] px-[4px]
          rounded-[200px] h-[14px] leading-[14px] -right-[7px] -top-[3px]'>{noticeNum > 99 ? "99+" : noticeNum}</div>}
          </div></Tooltip>}
        </PermissionButton>
        {!ENABLE_DATASTAX_LANGFLOW && (
          <>
          </>
        )}

        {!ENABLE_DATASTAX_LANGFLOW && (
          <>
          </>
        )}
        <div className="flex py-2.5 mr-[15px] items-center">
          <Dropdown menu={{ items }} placement="bottomLeft" arrow>
            <div className="flex items-center">
              <img className="h-[32px] w-[32px]" src={Personnel} />
              {userInfo?.realName && <><div className="text-[12px] text-white ml-[6px] text-[500] max-w-[80px] truncate mr-[4px]" style={{ fontWeight: 500 }}>{userInfo?.realName}</div>
                <Down theme="outline" size="14" fill="#8D97A3" /></>}
            </div>
          </Dropdown>
        </div> */}
      </div>

      {/* <PasswordChangeDialog
        visible={passwordDialogVisible}
        onClose={() => setPasswordDialogVisible(false)}
      /> */}
    </div>
  );
}
