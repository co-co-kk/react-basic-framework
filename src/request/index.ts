import axios from "axios";
axios.defaults.withCredentials = true;
import { Button, message, Space } from 'antd';
const customAxios = axios.create({
    // baseURL: import.meta.env.VITE_PROXY_TARGET,
    // baseURL: 'http://localhost:5001',
    // baseURL: '/api',
    // 配置
});
export const requestInterceptor = {
    remoteLoginFuc(msg) { }
};

customAxios.interceptors.request.use(function (config) {
    // const token = localStorage.getItem('ws_token');
    // const tstoken = ''

    // config.headers['Authorization'] = `*`

    config.headers['Access-Control-Allow-Origin'] = '*';
    return config;
}, function (error) {
    return Promise.reject(error);
});

customAxios.interceptors.response.use(function (response) {
    if (response.data.status_code === 200 || response.data.code === 200) {
        return response.data.data;
    }
    if (response.data.code === 0) {
        return response
    }


    if (response.data.status_code == 500) {
        message.error(response.data.status_message)
        return Promise.reject(response.data.status_message);
    }

    // const i18Msg = i18next.t(`errors.${response.data.status_code}`)
    // const errorMessage = i18Msg === `errors.${response.data.status_code}` ? response.data.status_message : i18Msg
    const errorMessage = response.data.status_message || response.data.message || response.data.msg

    // 无权访问
    if (response.data.status_code === 403) {
        // 修改不跳转
        if (response.config.method === 'get') {
            location.href = __APP_ENV__.BASE_URL + '/403'
        }
        return Promise.reject(errorMessage);
    }
    if (response.data.status_code === 401) {
        // 修改不跳转
        // if ( response && !response._retry) {
        //     response._retry = true // 避免无限递归
        //     return refreshAndRetry(response.config)
        // }
        return Promise.reject(errorMessage);
    }
    // 异地登录
    if (response.data.status_code === 10604) {
        // requestInterceptor.remoteLoginFuc(response.data.status_message)
        return Promise.reject(errorMessage);
    }
    return Promise.reject(errorMessage);
}, function (error) {
    // console.error('application error :>> ', error);
    if (error.response?.status === 401) {
        // if ((error?.status === 401) && error && !error.config.headers._retry) {
        //     // debugger
        //     error.config.headers._retry = true // 避免无限递归
        //     return refreshAndRetry(error.config)
        // }
        return Promise.reject('登录过期,请重新登录');
    }


    if (error.code === "ERR_CANCELED") return Promise.reject(null);
    // app 弹窗
    // window.errorAlerts([error.message])
    return Promise.reject(null);
})

export default customAxios


// 接口异常提示弹窗
export function captureAndAlertRequestErrorHoc(apiFunc, iocFunc?) {
    return apiFunc.catch(error => {
        if (error === null || error === undefined ) return // app error

        iocFunc?.(error)
        // 弹窗

        console.error('逻辑异常 :>> ', error);
        return false
    })
};
