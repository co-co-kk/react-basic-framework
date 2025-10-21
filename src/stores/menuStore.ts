import { create } from 'zustand';
import { getMenuTree, getRecentlyUsed, saveRecentlyUsed } from '@/api/menu/index';
import { message } from 'antd';
import { get } from 'lodash';

interface MenuItem {
  path: string;
  name: string;
  icon: string;
  code: string;
  id: string;
}

interface MenuStore {
  menuData: MenuItem[];
  defaultTags: MenuItem[];
  extraTagsData: MenuItem[];
  recentlUsedData: MenuItem[];
  isAdmin: boolean;
  isFrontendMenu: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsFrontendMenu: (isFrontendMenu: boolean) => void;
  setMenuData: (data: MenuItem[]) => void;
  fetchMenuData: () => Promise<void>;
  queryAdmin: () => Promise<void>;
  setRecentlUsed: (data: MenuItem[]) => void;
  getRecentlUsed: () => Promise<void>;
  saveRecentlyUsed: (code: string) => Promise<void>;
}

export const useMenuStore = create<MenuStore>((set) => ({
  menuData: [],
  defaultTags: [],
  extraTagsData: [],
  recentlUsedData: [],
  isAdmin: false,
  isFrontendMenu: true,

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  setIsFrontendMenu: (isFrontendMenu) => set({ isFrontendMenu }),

  setMenuData: (data) => set({
    menuData: data,
    defaultTags: data.slice(0, 4),
    extraTagsData: data.slice(4)
  }),

  setRecentlUsed: (data) => set({ recentlUsedData: data }),

  fetchMenuData: async () => {
    try {
      const res = await getMenuTree('tianshu_ai_frontend');
      if (res.code === 200) {
        const data = res.data.map(item => ({
          path: item.routePath,
          name: item.menuName,
          icon: item.icon,
          code: item.menuCode,
          id: item.id,
        })) || [];
        set({
          menuData: data,
          defaultTags: data.slice(0, 4),
          extraTagsData: data.slice(4),
          isFrontendMenu: true,
        });
      }
    } catch (error) {
      set({
        isFrontendMenu: false
      })
      console.error('菜单加载失败:');
      console.error(error);
      // message.error('菜单加载失败');
    }
  },
  queryAdmin: async () => {
    try {
      const adminRes = await getMenuTree('tianshu_ai_backend');
      set({ isAdmin: adminRes.code === 200 });
    } catch (error) {
      console.error('后台菜单加载失败:');
      console.error(error);
    }
  },
  getRecentlUsed: async () => {
    try {
      const res = await getRecentlyUsed();
      if (res.data.code === 200) {
        const data = res.data.data.map(item => ({
          path: item.routePath,
          name: item.menuName,
          icon: item.icon,
          code: item.menuCode,
          id: item.id,
        })) || [];
        set({ recentlUsedData: data });
      } else {
        console.error('查询最近使用菜单失败:');
        console.error(res.data.message);
      }
    } catch (error) {
      console.error('查询最近使用菜单失败:');
      console.error(error);
    }
  },
  saveRecentlyUsed: async (code: string) => {
    try {
      const res = await saveRecentlyUsed(code);
      if (res.data.code === 200) {
        const resList = await getRecentlyUsed();
        if (resList.data.code === 200) {
          const data = resList.data.data.map(item => ({
            path: item.routePath,
            name: item.menuName,
            icon: item.icon,
            code: item.menuCode,
            id: item.id,
          })) || [];
          set({ recentlUsedData: data });
        } else {
          console.error('查询最近使用菜单失败:');
          console.error(resList.data.message);
        }
      }
    } catch (error) {
      console.error('保存最近使用菜单失败:');
      console.error(error);
    }
  },
}));
