import api from '@/api/index';

interface updatePwd {
    oldPassword: any;
    password: any;
    disabledRepeat: number;
}

interface newUpdatePwd {
    oldPassword: any;
    confirmPassword: any;
    password: any;
}

// 修改密码
export const usePostUpdatePassword = (data: updatePwd) => {
    return api.post(`/api/platform/base/Users/Current/Actions/modifyPasswordNew`, data)
}

// 新-修改密码
export const updatePassword = (data: newUpdatePwd) => {
    return api.post(`/api/platform/admin/v1/account/update-password`, data)
}

export const getLast = () => {
    return api.get('/api/platform/oauth/baseAccountConfigModel/getLast')
}
