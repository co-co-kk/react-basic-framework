
import request from "@/request";
import useAuthStore from "@/stores/authStore";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let requestQueue: Array<(token: string) => void> = [];

async function refreshToken(): Promise<string> {

  const data = await request.get<RefreshTokenResponse>(
    `/api/platform/auth/v1/refresh-token?refreshToken=${localStorage.getItem("refresh_token_lf")}`,
  );

  const { accessToken, refreshToken } = data;
  localStorage.setItem("access_token_lf", accessToken);
  localStorage.setItem("refresh_token_lf", refreshToken);
  return accessToken;
}

export async function refreshAndRetry(originalRequest: any) {
    debugger
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshToken()
      .then((token) => {
        debugger
        requestQueue.forEach((cb) => cb(token));
        requestQueue = [];
        return token;
      })
      .catch((error) => {
        debugger
        requestQueue = [];
        // logout()
        throw error;
      })
      .finally(() => {
        debugger
        isRefreshing = false;
        refreshPromise = null;
      });
  }

  return new Promise((resolve, reject) => {
    requestQueue.push((token: string) => {
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: token,
      };
      request(originalRequest).then(resolve).catch(reject);
    });
  });
}
