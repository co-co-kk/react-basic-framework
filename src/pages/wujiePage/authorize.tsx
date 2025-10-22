import { useNavigate, useLocation } from "react-router-dom";
import { getAuthorizeUrl, toLogin } from '@/utils/getUrl';
import { InstanceofPlugin, DocElementRectPlugin } from "wujie-polyfill";
import WujiePageWrapper from "./WujiePageWrapper";

export default function QkAuthorize() {
  const location = useLocation();
  const navigation = useNavigate();
  const path = location.pathname;
  const search = location.search;

  const props = {
    jump: (name: string) => navigation(`/${name}`),
    toLogin,
  };
  // 使用 location.key 作为 key，确保每次路由变化都刷新
  const key = `${path}${search}`;

  return (
    <WujiePageWrapper
      name="authorize"
      key={key}
      url={`${getAuthorizeUrl()}${path}${search ? search : ''}`}
      plugins={[
        InstanceofPlugin(),
        DocElementRectPlugin(),
      ]}
      props={props}
    />
  );
}