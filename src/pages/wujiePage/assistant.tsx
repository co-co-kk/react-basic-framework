import { useNavigate, useLocation } from "react-router-dom";
import { getAssistantUrl, toLogin } from '@/utils/getUrl';
import { InstanceofPlugin, DocElementRectPlugin, LocationReloadPlugin, EventTargetPlugin, DocFullscreenPlugin } from "wujie-polyfill";
import WujiePageWrapper from "./WujiePageWrapper";

export default function QkAssistant() {
  const location = useLocation();
  const navigation = useNavigate();
  const path = location.pathname;
  const search = location.search;

  const props = {
    jump: (name: string) => navigation(`/${name}`),
    toLogin,
    // 其它自定义参数
  };
// 使用 location.key 作为 key，确保每次路由变化都刷新
  const key = `${path}${search}`;
  return (
    <WujiePageWrapper
      name="assistant"
      key={key}
      url={`${getAssistantUrl()}${path}${search ? search : ''}`}
      plugins={[
        InstanceofPlugin(),
        DocElementRectPlugin(),
        DocFullscreenPlugin(),
        LocationReloadPlugin(),
        EventTargetPlugin(),
        {
          patchElementHook(element, iframeWindow) {
            if (element.nodeName === 'STYLE') {
              element.insertAdjacentElement = function (_position, ele) {
                iframeWindow.document.head.appendChild(ele);
              };
            }
          },
        }
      ]}
      props={props}
    />
  );
}