import { Tooltip } from "antd";
import React, { memo, useRef, useState, useEffect, useMemo } from "react";
import './index.css';

interface TsTooltipProps {
  node: {
    label?: string | number | any;
    fontWig?: number; // 字体粗细
    maxLines?: number; // 最大行数（默认1行）
  };
  width?: number; // 父组件传入的当前宽度
  tooltipWidth?: number | string; // 提示框宽度（最大宽度）
  tooltipHeight?: number | string; // 提示框高度
  tooltipMaxHeight?: number | string; // 提示框最大高度（超出显示滚动条）
}

const TsTooltip: React.FC<TsTooltipProps> = memo(({ node, width, tooltipWidth, tooltipHeight, tooltipMaxHeight }) => {
  const DEFAULT_MAX_LINES = 1; // 默认单行溢出
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 检测文本是否溢出（实际渲染后的检测）
  const checkOverflow = () => {
    if (textRef.current) {
      const element = textRef.current;
      const isOverflowing =
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight;
      setShowTooltip(isOverflowing);
    }
  };

  useEffect(() => {
    // 初始检查
    checkOverflow();

    // 使用 ResizeObserver 监听尺寸变化
    if (typeof ResizeObserver !== 'undefined' && textRef.current) {
      resizeObserverRef.current = new ResizeObserver(checkOverflow);
      resizeObserverRef.current.observe(textRef.current);
    }

    return () => {
      // 清除监听
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [node.label, width]);

  // 动态生成样式（支持多行溢出）
  const textStyle: React.CSSProperties = useMemo(
    () => ({
      display: "-webkit-box",
      width: width ? `${width}px` : "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      WebkitLineClamp: node.maxLines ?? DEFAULT_MAX_LINES,
      WebkitBoxOrient: "vertical",
      fontWeight: node.fontWig || "normal",
      lineHeight: "1.5",
      whiteSpace: node.maxLines && node.maxLines > 1 ? "normal" : "nowrap",
    }),
    [node.fontWig, node.maxLines, width]
  );

  // 提示框内容样式
  const tooltipContentStyle: React.CSSProperties = useMemo(
    () => ({
      maxWidth: tooltipWidth 
        ? typeof tooltipWidth === 'number' ? `${tooltipWidth}px` : tooltipWidth 
        : 'none',
      height: tooltipHeight 
        ? typeof tooltipHeight === 'number' ? `${tooltipHeight}px` : tooltipHeight 
        : 'auto',
      maxHeight: tooltipMaxHeight 
        ? typeof tooltipMaxHeight === 'number' ? `${tooltipMaxHeight}px` : tooltipMaxHeight 
        : 'none',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '0 9px', //（为滚动条留空间）
      wordBreak: 'break-word',
      whiteSpace: 'normal',
      boxSizing: 'border-box',
    }),
    [tooltipWidth, tooltipHeight, tooltipMaxHeight]
  );

  if (!node.label) return null;

  return (
    <Tooltip
      // overlayStyle={{
      //   maxWidth: tooltipWidth 
      //     ? typeof tooltipWidth === 'number' ? `${tooltipWidth}px` : tooltipWidth 
      //     : 'none',
      //   padding: 0,
      // }}
      className="ts-tooltip-custom"
      title={showTooltip ? (
        <div className="tooltip-content" style={tooltipContentStyle}>
          {node.label}
        </div>
      ) : null}
      placement="top"
    >
      <div ref={textRef} style={textStyle}>
        {node.label || "--"}
      </div>
    </Tooltip>
  );
});

export default TsTooltip;