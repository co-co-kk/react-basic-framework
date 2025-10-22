import { getDocUrl, toLogin } from '@/utils/getUrl';
import { InstanceofPlugin, DocElementRectPlugin, LocationReloadPlugin } from "wujie-polyfill";
import { useLocation, useNavigate } from 'react-router-dom';
import WujiePageWrapper from "./WujiePageWrapper";

export default function QkDoc() {
  const location = useLocation();
  const navigation = useNavigate();
  const path = location.pathname;
  const search = location.search;

  // 使用 location.key 作为 key，确保每次路由变化都刷新
  const key = `${path}${search}`;

  const props = {
    jump: (name: string) => navigation(`/${name}`),
    toLogin,
  };

  return (
    <WujiePageWrapper
      key={key} // 🔥 强制刷新
      name="doc"
      url={`${getDocUrl()}${path}${search ? search : ''}`}
      plugins={[
        InstanceofPlugin(),
        DocElementRectPlugin(),
        LocationReloadPlugin(),
      ]}
      props={props}
    />
  );
}