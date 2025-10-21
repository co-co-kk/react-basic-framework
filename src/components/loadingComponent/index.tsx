import thinging from "@/assets/thinging.gif";

export default function LoadingComponent({remSize = 8,}): JSX.Element {
  return (

    <div role="status" className="flex flex-col items-center justify-center">
      <img
        src={thinging}
        alt="数据加载中"
        className="object-contain"
        style={{
          width: `${remSize * 50}px`,
          height: `${(remSize / 4) * 50}px`,
        }}
      />
    </div>
  );
}
