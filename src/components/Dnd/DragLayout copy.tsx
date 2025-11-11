import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

/**
 * DragLayoutEditor
 *
 * ✅ 满足的能力（对应用户要求）
 * 1. 能够上下拖拽块排序（同列内）
 * 2. 能够左右拖拽切换位置（跨列）
 * 3. 一列多行/多列场景：拖拽 A 到 B 的左右 0–16px 临界区域 → 在该行 B 左/右新增一列，A 落在新列
 * 4. 列之间的隔断（handle）可拖拽，动态改变左右块宽度（最小 10%）
 * 5. 可把块从某行/多列中拖出：在 D 的上/下侧边 0–16px 临界区域 → 新增一行并把块放入；原行如列空则删列，行空则删行
 *
 * ⚙️ 技术栈：React + react-dnd + Tailwind 原子化样式
 * 🔌 依赖：react, react-dom, react-dnd, react-dnd-html5-backend, uuid
 *
 * 注意：此组件为可嵌入示例。生产中可根据你的数据结构替换 BlockRenderer。
 */

/********************* 类型定义 *********************/
export type BlockNode = {
  id: string;
  // 任意渲染内容（可以是组件类型 + props，或直接 children）
  render?: React.ReactNode;
  // 可选：业务数据
  payload?: Record<string, any>;
};

export type ColumnNode = {
  id: string;
  widthPct: number; // 该列宽度百分比（总和约为 100）
  heightPct: number; // 该列宽度百分比（总和约为 100）
  blocks: BlockNode[];
};

export type RowNode = {
  id: string;
  columns: ColumnNode[];
};

export type LayoutState = RowNode[];

/********************* 常量 *********************/
const DND_TYPES = {
  BLOCK: "BLOCK",
};

const EDGE_THRESHOLD = 16; // px 上下左右临界值
const MIN_COL_WIDTH = 10; // % 最小列宽

/********************* 工具函数 *********************/
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

function newId(prefix: string) {
  return `${prefix}_${uuidv4()}`;
}

/********************* 主组件 *********************/
export default function DragLayoutEditor() {
  const [layout, setLayout] = useState<LayoutState>(() => [
    {
      id: newId("row"),
      columns: [
        { id: newId("col"), widthPct: 50,heightPct:100, blocks: [ { id: newId("blk"), render: <DemoCard title="A" /> }, { id: newId("blk"), render: <DemoCard title="A2" /> } ] },
        { id: newId("col"), widthPct: 50, heightPct:100, blocks: [ { id: newId("blk"), render: <DemoCard title="B" /> } ] },
      ],
    },
    {
      id: newId("row"),
      columns: [
        { id: newId("col"), widthPct: 100, heightPct:100, blocks: [ { id: newId("blk"), render: <DemoCard title="C" /> } ] },
      ],
    },
  ]);

  const handleChange = useCallback((next: LayoutState) => setLayout(next), []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full p-4 space-y-4 bg-slate-50">
        <Toolbar onReset={() => setLayout(generateSample())} />
        <Canvas layout={layout} onChange={handleChange} />
      </div>
    </DndProvider>
  );
}

function generateSample(): LayoutState {
  return [
    {
      id: newId("row"),
      columns: [
        { id: newId("col"), widthPct: 33.34, heightPct: 100, blocks: [ { id: newId("blk"), render: <DemoCard title="X" /> } ] },
        { id: newId("col"), widthPct: 33.33, heightPct: 200, blocks: [ { id: newId("blk"), render: <DemoCard title="Y" /> }, { id: newId("blk"), render: <DemoCard title="Y2" /> } ] },
        { id: newId("col"), widthPct: 33.33, heightPct: 300, blocks: [ { id: newId("blk"), render: <DemoCard title="Z" /> } ] },
      ],
    },
  ];
}

/********************* 画布 *********************/
function Canvas({ layout, onChange }: { layout: LayoutState; onChange: (l: LayoutState) => void; }) {
  const removeBlock = useCallback((blockId: string) => {
    const next = layout.map(row => ({ ...row, columns: row.columns.map(col => ({ ...col, blocks: col.blocks.filter(b => b.id !== blockId) })) }));
    // 清理空列/空行
    const cleaned: LayoutState = next
      .map(row => ({ ...row, columns: row.columns.filter(c => c.blocks.length > 0) }))
      .filter(row => row.columns.length > 0);
    onChange(cleaned.length ? cleaned : [ { id: newId("row"), columns: [ { id: newId("col"), widthPct: 100, heightPct:100, blocks: [] } ] } ]);
  }, [layout, onChange]);

  const insertIntoColumn = useCallback((targetRowId: string, targetColId: string, block: BlockNode, atIndex?: number) => {
    const next = layout.map(row => {
      if (row.id !== targetRowId) return row;
      return {
        ...row,
        columns: row.columns.map(col => {
          if (col.id !== targetColId) return col;
          const blocks = [...col.blocks];
          const idx = typeof atIndex === 'number' ? clamp(atIndex, 0, blocks.length) : blocks.length;
          blocks.splice(idx, 0, block);
          return { ...col, blocks };
        })
      };
    });
    onChange(next);
  }, [layout, onChange]);

  const insertNewColumnBeside = useCallback((targetRowId: string, targetColId: string, side: "left" | "right", block: BlockNode) => {
    const next = layout.map(row => {
      if (row.id !== targetRowId) return row;
      const cols = [...row.columns];
      const idx = cols.findIndex(c => c.id === targetColId);
      if (idx === -1) return row;

      // 新列默认宽度：从相邻列挤出 20%
      const newWidth = 20;
      const newCol: ColumnNode = { id: newId("col"), widthPct: newWidth, heightPct:100, blocks: [block] };

      // 压缩其它列的宽度以让总和 ~100
      const others = cols.map(c => ({ ...c }));
      const insertIndex = side === "left" ? idx : idx + 1;
      others.splice(insertIndex, 0, newCol);

      const total = sum(others.map(c => c.widthPct));
      // 归一化为 100
      others.forEach(c => { c.widthPct = (c.widthPct / total) * 100; });
      return { ...row, columns: others };
    });
    onChange(next);
  }, [layout, onChange]);

  const insertNewRow = useCallback((anchorRowId: string, position: "above" | "below", block: BlockNode) => {
    const next: LayoutState = [];
    layout.forEach(row => {
      if (row.id === anchorRowId && position === "above") {
        next.push({ id: newId("row"), columns: [ { id: newId("col"),heightPct:100, widthPct: 100, blocks: [block] } ] });
      }
      next.push(row);
      if (row.id === anchorRowId && position === "below") {
        next.push({ id: newId("row"), columns: [ { id: newId("col"),heightPct:100, widthPct: 100, blocks: [block] } ] });
      }
    });
    onChange(next);
  }, [layout, onChange]);

  const findBlock = useCallback((blockId: string) => {
    for (const r of layout) {
      for (const c of r.columns) {
        const idx = c.blocks.findIndex(b => b.id === blockId);
        if (idx >= 0) return { row: r, col: c, rowId: r.id, colId: c.id, index: idx };
      }
    }
    return null;
  }, [layout]);

  const moveBlockWithinOrAcross = useCallback((dragId: string, op: (block: BlockNode) => void) => {
    const where = findBlock(dragId);
    if (!where) return;
    const block = where.col.blocks[where.index];
    // 先移除
    const nextRemoved = layout.map(row => ({
      ...row,
      columns: row.columns.map(col => col.id === where.colId ? { ...col, blocks: col.blocks.filter(b => b.id !== dragId) } : col)
    }));
    // 清理空列 / 行
    const cleaned: LayoutState = nextRemoved
      .map(row => ({ ...row, columns: row.columns.filter(c => c.blocks.length > 0 || c.id === where.colId) }))
      .map(row => ({
        ...row,
        columns: row.columns.filter(c => c.blocks.length > 0) // 删除空列
      }))
      .filter(row => row.columns.length > 0); // 删除空行

    // 临时替换，执行 op 写入新位置
    const prev = layout; // 仅用于闭包
    (onChange as any)(cleaned);
    // 用 op 写入
    op(block);
  }, [layout, findBlock, onChange]);

  return (
    <div className="space-y-4">
      {layout.map((row) => (
        <RowView
          key={row.id}
          row={row}
          onResize={(colId, deltaPct) => {
            // 调整列宽：colId 与其右侧列之间分配
            const next = layout.map(r => {
              if (r.id !== row.id) return r;
              const cols = [...r.columns];
              const i = cols.findIndex(c => c.id === colId);
              if (i === -1 || i === cols.length - 1) return r;
              const left = { ...cols[i] };
              const right = { ...cols[i + 1] };
              // 应用并限制
              const leftNew = clamp(left.widthPct + deltaPct, MIN_COL_WIDTH, 100 - MIN_COL_WIDTH);
              const rightNew = clamp(right.widthPct - (leftNew - left.widthPct), MIN_COL_WIDTH, 100 - MIN_COL_WIDTH);
              left.widthPct = leftNew;
              right.widthPct = rightNew;
              cols[i] = left;
              cols[i + 1] = right;
              // 归一化总和为 100
              const total = sum(cols.map(c => c.widthPct));
              cols.forEach(c => c.widthPct = (c.widthPct / total) * 100);
              return { ...r, columns: cols };
            });
            onChange(next);
          }}
        >
          {row.columns.map((col, ci) => (
            <ColumnView
              key={col.id}
              rowId={row.id}
              col={col}
              onDropBlockCenter={(blockId, atIndex) => moveBlockWithinOrAcross(blockId, (blk) => insertIntoColumn(row.id, col.id, blk, atIndex))}
              onDropBlockLeft={(blockId) => moveBlockWithinOrAcross(blockId, (blk) => insertNewColumnBeside(row.id, col.id, "left", blk))}
              onDropBlockRight={(blockId) => moveBlockWithinOrAcross(blockId, (blk) => insertNewColumnBeside(row.id, col.id, "right", blk))}
              onDropBlockAbove={(blockId) => moveBlockWithinOrAcross(blockId, (blk) => insertNewRow(row.id, "above", blk))}
              onDropBlockBelow={(blockId) => moveBlockWithinOrAcross(blockId, (blk) => insertNewRow(row.id, "below", blk))}
            />
          ))}
        </RowView>
      ))}
    </div>
  );
}

/********************* 行视图（含分隔线 resize） *********************/
function RowView({ row, children, onResize }: { row: RowNode; children: React.ReactNode; onResize: (leftColId: string, deltaPct: number) => void; }) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  // 列间隔断拖拽
  const startDrag = useCallback((e: React.MouseEvent, leftColId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const rowEl = rowRef.current;
    if (!rowEl) return;
    const widthPx = rowEl.getBoundingClientRect().width;

    function onMove(me: MouseEvent) {
      const dx = me.clientX - startX;
      const deltaPct = (dx / widthPx) * 100;
      onResize(leftColId, deltaPct);
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [onResize]);

  return (
    <div ref={rowRef} className="flex w-full gap-2">
      {React.Children.map(children, (child, i) => (
        <>
          {child}
          {i < (row.columns.length - 1) && (
            <div
              role="separator"
              aria-orientation="vertical"
              onMouseDown={(e) => startDrag(e, row.columns[i].id)}
              className="w-1 cursor-col-resize bg-slate-300 hover:bg-slate-400 active:bg-slate-500 rounded"
              title="拖动调整列宽"
            />
          )}
        </>
      ))}
    </div>
  );
}

/********************* 列视图（接受拖拽） *********************/
function ColumnView({ rowId, col, onDropBlockCenter, onDropBlockLeft, onDropBlockRight, onDropBlockAbove, onDropBlockBelow }: {
  rowId: string;
  col: ColumnNode;
  onDropBlockCenter: (blockId: string, atIndex?: number) => void;
  onDropBlockLeft: (blockId: string) => void;
  onDropBlockRight: (blockId: string) => void;
  onDropBlockAbove: (blockId: string) => void;
  onDropBlockBelow: (blockId: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, dropCol] = useDrop(() => ({
    accept: DND_TYPES.BLOCK,
    drop: (item: any, monitor) => {
      const did = item.id as string;
      const client = monitor.getClientOffset();
      const el = ref.current;
      if (!client || !el) return;
      const rect = el.getBoundingClientRect();
      const withinLeft = client.x - rect.left <= EDGE_THRESHOLD;
      const withinRight = rect.right - client.x <= EDGE_THRESHOLD;
      const withinTop = client.y - rect.top <= EDGE_THRESHOLD;
      const withinBottom = rect.bottom - client.y <= EDGE_THRESHOLD;

      if (withinTop) return onDropBlockAbove(did);
      if (withinBottom) return onDropBlockBelow(did);
      if (withinLeft) return onDropBlockLeft(did);
      if (withinRight) return onDropBlockRight(did);
      return onDropBlockCenter(did);
    }
  }), [onDropBlockCenter, onDropBlockLeft, onDropBlockRight, onDropBlockAbove, onDropBlockBelow]);

  return (
    <div ref={dropCol(ref)} style={{ flexBasis: `${col.widthPct}%`, }} className="flex-1 min-w-[160px] rounded-xl bg-white shadow-sm border border-slate-200">
      {/* <div className="px-3 py-2 border-b bg-slate-50 text-slate-600 text-xs font-medium rounded-t-xl">列 {col.widthPct.toFixed(1)}%</div> */}
      {/* height: `${col.blocks.length == 1 ?'100%': `${col.heightPct}%`}` */}
        {/* {col.blocks.length} */}
      <div className={`p-2 ${col.blocks.length == 1?'h-full':''}`}>
        {col.blocks.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-6">拖拽块到这里</div>
        )}
        {col.blocks.map((blk, i) => (
          <BlockCard key={blk.id} block={blk} rowId={rowId} colId={col.id} index={i} onDropAbove={(id)=>onDropBlockCenter(id, i)} onDropBelow={(id)=>onDropBlockCenter(id, i+1)} onDropLeft={onDropBlockLeft} onDropRight={onDropBlockRight} onDropRowAbove={onDropBlockAbove} onDropRowBelow={onDropBlockBelow} />
        ))}
      </div>
    </div>
  );
}

/********************* 单个块（可拖拽 + 细粒度边缘判定） *********************/
function BlockCard({ block, rowId, colId, index, onDropAbove, onDropBelow, onDropLeft, onDropRight, onDropRowAbove, onDropRowBelow }: {
  block: BlockNode;
  rowId: string; colId: string; index: number;
  onDropAbove: (dragId: string) => void;
  onDropBelow: (dragId: string) => void;
  onDropLeft: (dragId: string) => void;
  onDropRight: (dragId: string) => void;
  onDropRowAbove: (dragId: string) => void;
  onDropRowBelow: (dragId: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DND_TYPES.BLOCK,
    item: { id: block.id, from: { rowId, colId, index } },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [block.id, rowId, colId, index]);

  const [, drop] = useDrop(() => ({
    accept: DND_TYPES.BLOCK,
    drop: (item: any, monitor) => {
      const client = monitor.getClientOffset();
      const el = ref.current;
      if (!client || !el) return;
      const rect = el.getBoundingClientRect();
      const withinLeft = client.x - rect.left <= EDGE_THRESHOLD;
      const withinRight = rect.right - client.x <= EDGE_THRESHOLD;
      const withinTop = client.y - rect.top <= EDGE_THRESHOLD;
      const withinBottom = rect.bottom - client.y <= EDGE_THRESHOLD;

      const did = item.id as string;
      if (withinTop) return onDropAbove(did); // 同列：插入到当前块上方
      if (withinBottom) return onDropBelow(did); // 同列：插入到当前块下方
      if (withinLeft) return onDropLeft(did); // 当前行：在本列左侧新建列
      if (withinRight) return onDropRight(did); // 当前行：在本列右侧新建列

      // 默认同列内靠近位置决定上下插入
      const centerY = rect.top + rect.height / 2;
      if (client.y < centerY) return onDropAbove(did);
      return onDropBelow(did);
    }
  }), [onDropAbove, onDropBelow, onDropLeft, onDropRight]);

  drag(drop(ref));

  return (
    <div ref={ref} className={`group relative mb-2 rounded-lg  border border-slate-200 bg-white shadow-sm p-3 cursor-move select-none h-full ${isDragging ? "opacity-50" : ""}`}>
      {/* 边缘可视化提示区 */}
      <div className="absolute inset-x-0 top-0 h-1.5 opacity-0 group-hover:opacity-100 bg-blue-200 rounded-t" />
      <div className="absolute inset-x-0 bottom-0 h-1.5 opacity-0 group-hover:opacity-100 bg-blue-200 rounded-b" />
      <div className="absolute left-0 inset-y-0 w-1.5 opacity-0 group-hover:opacity-100 bg-emerald-200 rounded-l" />
      <div className="absolute right-0 inset-y-0 w-1.5 opacity-0 group-hover:opacity-100 bg-emerald-200 rounded-r" />

      {/* <div className="text-xs text-slate-400 mb-1">#{block.id.slice(0, 8)}</div> */}
      <div className="h-full">
        {block.render ?? <DemoCard title={block.id.slice(0,4)} />}
      </div>
    </div>
  );
}

/********************* 示例渲染卡片 *********************/
function DemoCard({ title }: { title: string }) {
  return (
    <div className="rounded-md border h-full border-slate-200 p-3 bg-slate-50">
      <div className="text-sm font-medium text-slate-700">块：{title}</div>
      <div className="text-xs text-slate-500">任意内容/组件都可替换</div>
    </div>
  );
}

/********************* 顶部工具栏 *********************/
function Toolbar({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-600">拖拽到块的 <span className="font-medium">上/下/左/右 0–16px</span> 临界区域可新增行或列；列间灰色竖条可拖动调整宽度。</div>
      <div className="flex items-center gap-2">
        <button onClick={onReset} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">重置示例</button>
      </div>
    </div>
  );
}
