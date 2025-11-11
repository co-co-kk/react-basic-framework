import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

/**
 * 可拖拽配置的NocoBase风格页面 - 结合可调整列宽功能的新版本
 * - 多行多列布局
 * - 拖拽调整列宽（使用zuoyou中的方法）
 * - 可配置的表格等组件
 * - 使用手柄拖拽（仅在点击拖拽图标时可拖拽）
 */

/********************* 类型定义 *********************/
type Block = { 
  id: string; 
  componentName: string;
  props: any;
};

type Column = { 
  id: string; 
  widthPct: number; 
  blocks: Block[] 
};

type Row = { 
  id: string; 
  columns: Column[] 
};

type Layout = Row[];

/********************* 常量与工具 *********************/
const MIN_COL = 10; // 最小列宽（百分比）
const newid = (p: string) => `${p}_${uuidv4()}`;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

// 可用组件类型
const AVAILABLE_COMPONENTS = [
  {
    key: "Header",
    label: "页面标题",
    defaultData: {
      componentName: "Header",
      props: {
        title: "新标题",
      },
    },
  },
  {
    key: "Table",
    label: "数据表格",
    defaultData: {
      componentName: "Table",
      props: {
        dataSource: [
          { id: "1", name: "示例数据1", value: "示例值1" },
          { id: "2", name: "示例数据2", value: "示例值2" },
        ],
        columns: [
          { title: "ID", dataIndex: "id" },
          { title: "名称", dataIndex: "name" },
          { title: "值", dataIndex: "value" },
        ],
      },
    },
  },
  {
    key: "Card",
    label: "内容卡片",
    defaultData: {
      componentName: "Card",
      props: {
        title: "新卡片",
        content: "这是一个内容卡片，可以展示各种信息。",
        height: 200,
      },
    },
  },
  {
    key: "Chart",
    label: "数据图表",
    defaultData: {
      componentName: "Chart",
      props: {
        title: "数据图表",
        chartType: "bar",
        data: [
          { name: "数据1", value: 10 },
          { name: "数据2", value: 20 },
          { name: "数据3", value: 30 },
        ],
      },
    },
  }
];

/********************* 组件实现 *********************/
const Header = ({ title }: { title: string }) => (
  <div className="p-4 bg-white rounded-lg shadow mb-4">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
  </div>
);

const Card = ({ title, content, height }: { title: string; content: string; height: number }) => (
  <div className="p-4 bg-white rounded-lg shadow mb-4" style={{ height }}>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-gray-600">{content}</p>
  </div>
);

const Table = ({ dataSource, columns }: { dataSource: any[]; columns: any[] }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {dataSource.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row[column.dataIndex]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Chart = ({ title, chartType, data }: { title: string; chartType: string; data: any[] }) => (
  <div className="p-4 bg-white rounded-lg shadow mb-4">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      <p className="text-gray-500">图表类型: {chartType}</p>
      <div className="ml-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="w-20">{item.name}:</span>
            <div 
              className="h-6 bg-blue-500 rounded mr-2"
              style={{ width: `${item.value * 5}px` }}
            ></div>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ComponentRenderer = ({ block }: { block: Block }) => {
  switch (block.componentName) {
    case "Header":
      return <Header {...block.props} />;
    case "Card":
      return <Card {...block.props} />;
    case "Table":
      return <Table {...block.props} />;
    case "Chart":
      return <Chart {...block.props} />;
    default:
      return <div>未知组件: {block.componentName}</div>;
  }
};

/********************* 拖拽相关组件 *********************/
// 修改后的拖拽手柄组件
const DragHandle = ({ id }: { id: string }) => {
  const { attributes, listeners } = useDraggable({ id });
  
  return (
    <div 
      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
      {...attributes} 
      {...listeners}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
      </svg>
    </div>
  );
};

const DraggableComponent = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

const DragGhost = ({ block }: { block: Block }) => {
  return (
    <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-md p-3 shadow-lg opacity-90">
      <ComponentRenderer block={block} />
    </div>
  );
};

/********************* 布局帮助器 *********************/
const layoutHelpers = (layout: Layout, setLayout: React.Dispatch<React.SetStateAction<Layout>>) => {
  const findBlock = (id: string) => {
    for (const r of layout) {
      for (const c of r.columns) {
        const i = c.blocks.findIndex((b) => b.id === id);
        if (i !== -1) return { row: r, col: c, rowId: r.id, colId: c.id, index: i, block: c.blocks[i] };
      }
    }
    return null;
  };

  const removeBlockById = (id: string) => {
    let removed: Block | null = null;
    const next = layout.map((r) => ({
      ...r,
      columns: r.columns.map((c) => {
        const idx = c.blocks.findIndex((b) => b.id === id);
        if (idx !== -1) {
          const clone = [...c.blocks];
          removed = clone.splice(idx, 1)[0];
          return { ...c, blocks: clone };
        }
        return c;
      }),
    }));
    return { removed, next };
  };

  const findRowIdByColId = (colId: string): string | null => {
    for (const r of layout) {
      if (r.columns.some((c) => c.id === colId)) return r.id;
    }
    return null;
  };

  const cleanup = (rows: Layout): Layout => {
    const cleaned = rows
      .map((r) => ({ ...r, columns: r.columns.filter((c) => c.blocks.length > 0) }))
      .filter((r) => r.columns.length > 0);
    return cleaned.length ? normalizeRowWidths(cleaned) : [emptyRow()];
  };

  const normalizeRowWidths = (rows: Layout) =>
    rows.map((r) => {
      const total = sum(r.columns.map((c) => c.widthPct));
      if (!total) return r;
      const cols = r.columns.map((c) => ({ ...c, widthPct: (c.widthPct / total) * 100 }));
      return { ...r, columns: cols };
    });

  const emptyRow = (): Row => ({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [] }] });

  // 插入/移动 API
  const insertBeforeBlock = (anchorBlockId: string, block: Block) => {
    setLayout((prev) =>
      cleanup(
        prev.map((r) => ({
          ...r,
          columns: r.columns.map((c) => {
            const i = c.blocks.findIndex((b) => b.id === anchorBlockId);
            if (i === -1) return c;
            const clone = [...c.blocks];
            clone.splice(i, 0, block);
            return { ...c, blocks: clone };
          }),
        }))
      )
    );
  };

  const insertAfterBlock = (anchorBlockId: string, block: Block) => {
    setLayout((prev) =>
      cleanup(
        prev.map((r) => ({
          ...r,
          columns: r.columns.map((c) => {
            const i = c.blocks.findIndex((b) => b.id === anchorBlockId);
            if (i === -1) return c;
            const clone = [...c.blocks];
            clone.splice(i + 1, 0, block);
            return { ...c, blocks: clone };
          }),
        }))
      )
    );
  };

  const insertNewColumnBesideBlock = (anchorBlockId: string, side: "left" | "right", block: Block) => {
    setLayout((prev) =>
      cleanup(
        prev.map((r) => {
          const colIdx = r.columns.findIndex((c) => c.blocks.some((b) => b.id === anchorBlockId));
          if (colIdx === -1) return r;
          const cols = [...r.columns];
          const insertIdx = side === "left" ? colIdx : colIdx + 1;

          const newCol: Column = { id: newid("col"), widthPct: 20, blocks: [block] };
          cols.splice(insertIdx, 0, newCol);

          let total = sum(cols.map((c) => c.widthPct));
          cols.forEach((c) => (c.widthPct = (c.widthPct / total) * 100));
          // 最小列宽校正
          for (let i = 0; i < cols.length; i++) {
            if (cols[i].widthPct < MIN_COL) {
              const need = MIN_COL - cols[i].widthPct;
              const takeFrom = i > 0 ? i - 1 : i + 1;
              cols[takeFrom].widthPct = clamp(cols[takeFrom].widthPct - need, MIN_COL, 100 - MIN_COL);
              cols[i].widthPct = MIN_COL;
            }
          }
          total = sum(cols.map((c) => c.widthPct));
          cols.forEach((c) => (c.widthPct = (c.widthPct / total) * 100));
          return { ...r, columns: cols };
        })
      )
    );
  };

  const insertNewRowBesideBlock = (anchorBlockId: string, pos: "above" | "below", block: Block) => {
    setLayout((prev) => {
      const next: Layout = [];
      for (const r of prev) {
        const isAnchorRow = r.columns.some((c) => c.blocks.some((b) => b.id === anchorBlockId));
        if (isAnchorRow && pos === "above") {
          next.push({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [block] }] });
        }
        next.push(r);
        if (isAnchorRow && pos === "below") {
          next.push({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [block] }] });
        }
      }
      return cleanup(next);
    });
  };

  const moveBlockToNewRowAt = (draggedId: string, rowId: string, pos: "above" | "below") => {
    const { removed, next } = removeBlockById(draggedId);
    if (!removed) return;
    setLayout(
      cleanup(
        ((): Layout => {
          const out: Layout = [];
          for (const r of next) {
            if (r.id === rowId && pos === "above") {
              out.push({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [removed] }] });
            }
            out.push(r);
            if (r.id === rowId && pos === "below") {
              out.push({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [removed] }] });
            }
          }
          return out;
        })()
      )
    );
  };

  // 移动（非复制）：先移除，再按 action 插入
  const moveBlockToAction = (
    draggedId: string,
    action:
      | { type: "before"; anchorId: string }
      | { type: "after"; anchorId: string }
      | { type: "new-col"; side: "left" | "right"; anchorId: string }
      | { type: "new-row"; pos: "above" | "below"; anchorId: string }
      | { type: "append-col"; rowId: string; colId: string }
  ) => {
    const { removed, next } = removeBlockById(draggedId);
    if (!removed) return;
    setLayout(
      cleanup(
        ((): Layout => {
          const prev = next;
          switch (action.type) {
            case "before":
              return prev.map((r) => ({
                ...r,
                columns: r.columns.map((c) => {
                  const i = c.blocks.findIndex((b) => b.id === action.anchorId);
                  if (i === -1) return c;
                  const clone = [...c.blocks];
                  clone.splice(i, 0, removed);
                  return { ...c, blocks: clone };
                }),
              }));
            case "after":
              return prev.map((r) => ({
                ...r,
                columns: r.columns.map((c) => {
                  const i = c.blocks.findIndex((b) => b.id === action.anchorId);
                  if (i === -1) return c;
                  const clone = [...c.blocks];
                  clone.splice(i + 1, 0, removed);
                  return { ...c, blocks: clone };
                }),
              }));
            case "new-col":
              return prev.map((r) => {
                const colIdx = r.columns.findIndex((c) => c.blocks.some((b) => b.id === action.anchorId));
                if (colIdx === -1) return r;
                const cols = [...r.columns];
                const insertIdx = action.side === "left" ? colIdx : colIdx + 1;
                const newCol: Column = { id: newid("col"), widthPct: 20, blocks: [removed] };
                cols.splice(insertIdx, 0, newCol);
                let total = sum(cols.map((c) => c.widthPct));
                cols.forEach((c) => (c.widthPct = (c.widthPct / total) * 100));
                for (let i = 0; i < cols.length; i++) {
                  if (cols[i].widthPct < MIN_COL) {
                    const need = MIN_COL - cols[i].widthPct;
                    const takeFrom = i > 0 ? i - 1 : i + 1;
                    cols[takeFrom].widthPct = clamp(cols[takeFrom].widthPct - need, MIN_COL, 100 - MIN_COL);
                    cols[i].widthPct = MIN_COL;
                  }
                }
                total = sum(cols.map((c) => c.widthPct));
                cols.forEach((c) => (c.widthPct = (c.widthPct / total) * 100));
                return { ...r, columns: cols };
              });
            case "new-row": {
              const out: Layout = [];
              for (const r of prev) {
                const isAnchorRow = r.columns.some((c) => c.blocks.some((b) => b.id === action.anchorId));
                if (isAnchorRow && action.pos === "above") {
                  out.push({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [removed] }] });
                }
                out.push(r);
                if (isAnchorRow && action.pos === "below") {
                  out.push({ id: newid("row"), columns: [{ id: newid("col"), widthPct: 100, blocks: [removed] }] });
                }
              }
              return out;
            }
            case "append-col":
              return prev.map((r) =>
                r.id === action.rowId
                  ? {
                      ...r,
                      columns: r.columns.map((c) => (c.id === action.colId ? { ...c, blocks: [...c.blocks, removed!] } : c)),
                    }
                  : r
              );
          }
        })()
      )
    );
  };

  const resize = (rowId: string, leftColId: string, deltaPct: number) => {
    setLayout((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const cols = [...r.columns];
        const i = cols.findIndex((c) => c.id === leftColId);
        if (i === -1 || i === cols.length - 1) return r;
        const L = { ...cols[i] };
        const R = { ...cols[i + 1] };
        const leftNew = clamp(L.widthPct + deltaPct, MIN_COL, 100 - MIN_COL);
        const rightNew = clamp(R.widthPct - (leftNew - L.widthPct), MIN_COL, 100 - MIN_COL);
        L.widthPct = leftNew;
        R.widthPct = rightNew;
        cols[i] = L;
        cols[i + 1] = R;
        const total = sum(cols.map((c) => c.widthPct));
        cols.forEach((c) => (c.widthPct = (c.widthPct / total) * 100));
        return { ...r, columns: cols };
      })
    );
  };

  return {
    findBlock,
    findRowIdByColId,
    moveBlockToNewRowAt,
    moveBlockToAction,
    insertBeforeBlock,
    insertAfterBlock,
    insertNewColumnBesideBlock,
    insertNewRowBesideBlock,
    resize,
  } as const;
};

/********************* 画布/行/列/块 *********************/
const Canvas = ({ layout, helpers }: { layout: Layout; helpers: ReturnType<typeof layoutHelpers> }) => {
  return (
    <div className="space-y-4">
      {layout.map((row) => (
        <RowView key={row.id} row={row} helpers={helpers} />
      ))}
    </div>
  );
};

const RowView = ({ row, helpers }: { row: Row; helpers: ReturnType<typeof layoutHelpers> }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [colSizes, setColSizes] = useState<number[]>(() => 
    row.columns.map(col => col.widthPct)
  );

  // 当列变化时更新 sizes 数组
  useEffect(() => {
    setColSizes(prev => {
      const newSizes = [...prev];
      // 确保数组长度与列数一致
      while (newSizes.length < row.columns.length) {
        newSizes.push(0);
      }
      if (newSizes.length > row.columns.length) {
        newSizes.splice(row.columns.length);
      }
      // 如果所有值都是 0，则平均分配
      if (newSizes.every(size => size === 0)) {
        return row.columns.map(() => 100 / row.columns.length);
      }
      return newSizes;
    });
  }, [row.columns]);

  // 处理鼠标移动事件 (使用zuoyou中的方法)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || dragIndex === null || !rowRef.current) return;
      
      const containerRect = rowRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const percentage = (x / containerRect.width) * 100;
      
      // 计算拖拽的分隔线两侧列的新尺寸
      const leftColIndex = dragIndex;
      const rightColIndex = dragIndex + 1;
      
      if (rightColIndex >= colSizes.length) return;
      
      // 计算左侧和右侧面板的新尺寸
      const totalSize = colSizes[leftColIndex] + colSizes[rightColIndex];
      const leftColNewSize = Math.min(Math.max(MIN_COL, percentage - getAccumulatedSize(leftColIndex)), totalSize - MIN_COL);
      const rightColNewSize = totalSize - leftColNewSize;
      
      // 更新尺寸数组
      const newSizes = [...colSizes];
      newSizes[leftColIndex] = leftColNewSize;
      newSizes[rightColIndex] = rightColNewSize;
      
      setColSizes(newSizes);
      
      // 同步更新到 layout
      helpers.resize(row.id, row.columns[leftColIndex].id, leftColNewSize - row.columns[leftColIndex].widthPct);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragIndex(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragIndex, colSizes, helpers, row.id, row.columns]);

  // 计算指定索引之前所有列的累计尺寸
  const getAccumulatedSize = (index: number): number => {
    return colSizes.slice(0, index).reduce((acc, size) => acc + size, 0);
  };

  const startDrag = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
  };

  // 行上下边缘 droppable：用于新增行
  const topId = `${row.id}__row_top`;
  const bottomId = `${row.id}__row_bottom`;
  const { setNodeRef: setTopRef, isOver: overTop } = useDroppable({ id: topId });
  const { setNodeRef: setBottomRef, isOver: overBottom } = useDroppable({ id: bottomId });

  return (
    <div className="relative">
      {/* 行顶部边缘投放 */}
      <div ref={setTopRef} className="absolute -top-2 left-4 right-4 h-4" />
      {overTop && <div className="absolute -top-1 left-4 right-4 h-[2px] border-t-2 border-dashed border-blue-400" />}

      <div ref={rowRef} className="flex w-full gap-2">
        {row.columns.map((col, idx) => (
          <React.Fragment key={col.id}>
            <ColumnView rowId={row.id} col={col} helpers={helpers} widthPct={colSizes[idx] || col.widthPct} />
            {idx < row.columns.length - 1 && (
              <div 
                className="w-2 bg-gray-300 cursor-col-resize relative transition-colors hover:bg-blue-400 flex items-center justify-center"
                onMouseDown={startDrag(idx)}
              >
                <div className="w-1 h-8 bg-gray-500 rounded"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 行底部边缘投放 */}
      <div ref={setBottomRef} className="absolute -bottom-0 left-4 right-4 h-4" />
      {overBottom && <div className="absolute -bottom-1 left-4 right-4 h-[2px] border-b-2 border-dashed border-blue-400" />}
    </div>
  );
};

const ColumnView = ({ rowId, col, helpers, widthPct }: { rowId: string; col: Column; helpers: ReturnType<typeof layoutHelpers>; widthPct?: number }) => {
  const centerId = `col-center-${col.id}`;
  const { setNodeRef: setCenterRef, isOver: overCenter } = useDroppable({ id: centerId });

  return (
    <div className="flex-1 rounded-xl bg-white shadow-sm border border-slate-200" style={{ flexBasis: `${widthPct || col.widthPct}%` }}>
      <div className="px-3 py-2 border-b bg-slate-50 text-slate-600 text-xs font-medium rounded-t-xl flex items-center justify-between">
        <span>列 {(widthPct || col.widthPct).toFixed(1)}%</span>
        <span className="text-[10px] text-slate-400">{col.blocks.length} 块</span>
      </div>
      <div ref={setCenterRef} className="p-2 relative min-h-[8px]">
        {overCenter && <div className="absolute inset-2 rounded border-2 border-dashed border-blue-300 pointer-events-none" />}

        {col.blocks.map((b) => (
          <BlockCard key={b.id} block={b} rowId={rowId} colId={col.id} helpers={helpers} />
        ))}
      </div>
    </div>
  );
};

/********************* 块 + 四边缘投放区 *********************/
const BlockCard = ({ block, rowId, colId, helpers }: { block: Block; rowId: string; colId: string; helpers: ReturnType<typeof layoutHelpers> }) => {
  const { setNodeRef, transform, isDragging } = useDraggable({ id: block.id });
  const style: React.CSSProperties = { 
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const topId = `${block.id}__top`;
  const bottomId = `${block.id}__bottom`;
  const leftId = `${block.id}__left`;
  const rightId = `${block.id}__right`;

  const { setNodeRef: setTopRef, isOver: isOverTop } = useDroppable({ id: topId });
  const { setNodeRef: setBottomRef, isOver: isOverBottom } = useDroppable({ id: bottomId });
  const { setNodeRef: setLeftRef, isOver: isOverLeft } = useDroppable({ id: leftId });
  const { setNodeRef: setRightRef, isOver: isOverRight } = useDroppable({ id: rightId });

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative mb-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm select-none transition-all duration-200 ease-in-out ${isDragging ? "scale-[0.98] shadow-lg ring-2 ring-blue-500/20" : "hover:shadow-md hover:border-blue-300"}`}
    >
      <div className="cursor-default p-3 rounded-t-xl bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {block.componentName}
          </div>
          <div className="flex space-x-1">
            <DragHandle id={block.id} />
          </div>
        </div>
      </div>
      
      <div ref={setTopRef} className="absolute inset-x-0 -top-2 h-2" />
      <div ref={setBottomRef} className="absolute inset-x-0 -bottom-2 h-2" />
      <div ref={setLeftRef} className="absolute -left-2 inset-y-0 w-2" />
      <div ref={setRightRef} className="absolute -right-2 inset-y-0 w-2" />

      {isOverTop && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>}
      {isOverBottom && <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>}
      {isOverLeft && <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>}
      {isOverRight && <div className="absolute right-0 inset-y-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>}

      <div className="p-4">
        <ComponentRenderer block={block} />
      </div>
    </div>
  );
};

/********************* 工具栏 *********************/
const Toolbar = ({ onAddComponent, onReset }: { onAddComponent: (component: any) => void; onReset: () => void }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {AVAILABLE_COMPONENTS.map((component) => (
          <button
            key={component.key}
            onClick={() => onAddComponent(component.defaultData)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            添加{component.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onReset} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
          重置布局
        </button>
      </div>
    </div>
  );
};

/********************* 初始化布局 *********************/
const initLayout = (): Layout => {
  return [
    {
      id: newid("row"),
      columns: [
        {
          id: newid("col"),
          widthPct: 100,
          blocks: [
            {
              id: newid("blk"),
              componentName: "Header",
              props: {
                title: "头部"
              }
            }
          ],
        },
      ],
    },
    {
      id: newid("row"),
      columns: [
        {
          id: newid("col"),
          widthPct: 50,
          blocks: [
            {
              id: newid("blk"),
              componentName: "Table",
              props: {
                dataSource: [
                  { id: "1", name: "用户A", value: "活跃" },
                  { id: "2", name: "用户B", value: "离线" },
                ],
                columns: [
                  { title: "ID", dataIndex: "id" },
                  { title: "名称", dataIndex: "name" },
                  { title: "状态", dataIndex: "value" },
                ],
              },
            }
          ],
        },
        {
          id: newid("col"),
          widthPct: 50,
          blocks: [
            {
              id: newid("blk"),
              componentName: "Card",
              props: {
                title: "系统信息",
                content: "这是一个可配置的卡片组件，可以展示各种信息。",
                height: 200,
              },
            }
          ],
        },
      ],
    }
  ];
};

/********************* 顶层组件 *********************/
const NewDndPage = () => {
  const [layout, setLayout] = useState<Layout>(() => initLayout());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const helpers = layoutHelpers(layout, setLayout);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragCancel = () => setActiveId(null);
  const onDragOver = (_e: DragOverEvent) => {};
  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id as string | undefined;
    const dragId = e.active?.id as string | undefined;
    if (!overId || !dragId) { 
      setActiveId(null); 
      return; 
    }
    
    if (overId.endsWith("__top")) {
      helpers.moveBlockToAction(dragId, { type: "before", anchorId: overId.replace("__top", "") });
    } else if (overId.endsWith("__bottom")) {
      helpers.moveBlockToAction(dragId, { type: "after", anchorId: overId.replace("__bottom", "") });
    } else if (overId.endsWith("__left")) {
      helpers.moveBlockToAction(dragId, { type: "new-col", side: "left", anchorId: overId.replace("__left", "") });
    } else if (overId.endsWith("__right")) {
      helpers.moveBlockToAction(dragId, { type: "new-col", side: "right", anchorId: overId.replace("__right", "") });
    } else if (overId.startsWith("col-center-")) {
      const colId = overId.replace("col-center-", "");
      const rowId = helpers.findRowIdByColId(colId);
      if (rowId) helpers.moveBlockToAction(dragId, { type: "append-col", rowId, colId });
    } else if (overId.endsWith("__row_top")) {
      const rowId = overId.replace("__row_top", "");
      helpers.moveBlockToNewRowAt(dragId, rowId, "above");
    } else if (overId.endsWith("__row_bottom")) {
      const rowId = overId.replace("__row_bottom", "");
      helpers.moveBlockToNewRowAt(dragId, rowId, "below");
    }
    setActiveId(null);
  };

  const handleAddComponent = (componentData: any) => {
    // 添加到第一个列中
    if (layout.length > 0 && layout[0].columns.length > 0) {
      const firstCol = layout[0].columns[0];
      const newBlock = {
        ...componentData,
        id: newid("blk")
      };
      
      setLayout(prev => {
        const newLayout = [...prev];
        newLayout[0] = {
          ...newLayout[0],
          columns: newLayout[0].columns.map(col => 
            col.id === firstCol.id 
              ? { ...col, blocks: [...col.blocks, newBlock] } 
              : col
          )
        };
        return newLayout;
      });
    }
  };

  const handleReset = () => {
    setLayout(initLayout());
  };

  const findBlock = (id: string) => {
    for (const r of layout) {
      for (const c of r.columns) {
        const i = c.blocks.findIndex((b) => b.id === id);
        if (i !== -1) return c.blocks[i];
      }
    }
    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragCancel={onDragCancel}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="w-full h-screen p-4 space-y-4 bg-slate-50">
        <Toolbar onAddComponent={handleAddComponent} onReset={handleReset} />
        <Canvas layout={layout} helpers={helpers} />
      </div>

      <DragOverlay>
        {activeId ? <DragGhost block={findBlock(activeId) as Block} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default NewDndPage;