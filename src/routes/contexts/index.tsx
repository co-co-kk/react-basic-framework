import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPermissions } from "@/api/menu/index";// 小星调用权限接口
import { usePermissionStore } from '@/stores/permissionStore';
import useAuthStore from "@/stores/authStore";

export default function ContextWrapper({ children }: { children: ReactNode }) {
  const pathname = useLocation().pathname;
  const [isReady, setIsReady] = useState(false)
  const useLogout = useAuthStore((state) => state.logout);
  const isDownline = useAuthStore((state) => state.isDownline);
  const setIsDownline = useAuthStore((state) => state.setIsDownline);
  // 登出
  const logOut = () => {
    setIsDownline(false)
    useLogout()
  }

  useEffect(() => {
    console.log('pathname', pathname);
    // 获取权限数据并更新Store
    getPermissions('tianshu_ai_frontend').then((res) => {
      if (res?.code === 200) {
        const permissions = res.data;
        const storedPermissions = usePermissionStore.getState().buttonPermission
        console.log(permissions.length, 'permissionspermissions');
        if (JSON.stringify(permissions) !== JSON.stringify(storedPermissions)) {
          localStorage.setItem('buttonPermission', JSON.stringify(permissions));
          usePermissionStore.getState().updatePermissions(permissions);
        }
        usePermissionStore.getState().setIsPermissionLoaded(true);
        // console.log(res, 'res buttonPermission', permissions);
      }
      setIsReady(true)
    }).catch(error => {
      setIsReady(true)
      usePermissionStore.getState().setIsPermissionLoaded(true); // 即使失败也设置为 true，避免无限等待
      console.error('获取权限失败:', error);
    });

  }, [pathname]);

  //element to wrap all context
  return (
    <>
       {isReady && children}
       {/* { children} */}
      {/* <TsModal
        title="账号下线通知"
        open={isDownline}
        onCancel={() => setIsDownline(false)}
        width="600px"
        height="380px"
        showCloseIcon={false}
        customBorderRadius="10px"
        bodyPadding="0px"
        contentPadding="0px"
        showHeader={false}
        showFooter={false}
      >
        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(180deg, rgba(227,236,251,1) 0%,rgba(255,255,255,1) 41%)' }}
          className="flex flex-col items-center  p-[20px]"
        >
          <div className="w-full flex items-center gap-[10px]" >
            <RiAlertFill size={20} color="#F8544B" />
            <span className="text-[#092C4D] text-[16px] font-medium">
              账号下线通知
            </span>
          </div>
          <div className="w-[100px] h-[82px] mt-[56px] mb-[34px]">
            <img src={warningImg} alt="warning" style={{ width: '100px', height: '82px' }} />
          </div>
          <span className="text-[#092C4D] text-[16px] font-[HarmonyOS_Sans_SC-regular]">
            您的账号已在其他浏览器登录，当前浏览器已自动退出。
          </span>
          <div className=" w-full flex items-center justify-end mt-[85px]">
            <Button onClick={logOut} className="w-[100px] h-[34px] bg-[#002FA7] text-[#ffffff]">
              重新登录
            </Button>
          </div>
        </div>
      </TsModal> */}
    </>
  );
}
