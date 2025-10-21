import { useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  //错误信息，可用来错误上报
  // eslint-disable-next-line no-console
  console.log(error);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>意外的应用错误！</h2>
      <p>抱歉，页面出现了意外错误。</p>
      <details
        style={{
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <summary>错误详情</summary>
        {(error as Error)?.message || (error as { statusText?: string })?.statusText || String(error)}
      </details>
    </div>
  );
}
