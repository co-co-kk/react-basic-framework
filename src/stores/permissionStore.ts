import { create } from 'zustand';

interface PermissionState {
  buttonPermission: string[];
  updatePermissions: (permissions: string[]) => void;
  isPermissionLoaded: boolean;
  setIsPermissionLoaded: (isLoaded: boolean) => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  buttonPermission: [],
  isPermissionLoaded: false,
  setIsPermissionLoaded: (isLoaded) =>
    set(() => ({
      isPermissionLoaded: isLoaded,
    })),
  updatePermissions: (permissions) => {
    set(() => ({
      buttonPermission: permissions,
    }))
  },
}));