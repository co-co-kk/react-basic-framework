import { getInsightUrl, toLogin } from '@/utils/getUrl';
import { InstanceofPlugin, DocElementRectPlugin, LocationReloadPlugin } from "wujie-polyfill";
import { useLocation, useNavigate } from 'react-router-dom';
import WujiePageWrapper from "./WujiePageWrapper";

export default function QkInsight() {
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
  // 问数

  return (
    // 123
    <>
    {/* {`${getInsightUrl()}${path}`} */}
    {/* <iframe src={`${getInsightUrl()}${path}${search ? search : ''}`} frameborder="0"></iframe> */}
    <WujiePageWrapper
      name="insight"
      key={key}
      url={`${getInsightUrl()}/insight${path}${search ? search : ''}`}
      plugins={[
        InstanceofPlugin(),
        DocElementRectPlugin(),
        LocationReloadPlugin(),
      ]}
      props={props}
      />
      </>
  );
}
