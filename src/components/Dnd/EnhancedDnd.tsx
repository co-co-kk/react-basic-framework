import React, { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOutlined, PlusOutlined } from '@ant-design/icons';
import './EnhancedDnd.css';

// 定义项的类型
interface Item {
  id: string;
  content: string;
}

// 定义行的类型
interface Row {
  id: string;
  items: Item[];
  isMultiColumn?: boolean;
}

// 可排序项组件
const SortableItem = ({ 
  id, 
  item,
  isHorizontal = false,
  isActive = false,
}: { 
  id: string; 
  item: Item;
  isHorizontal?: boolean;
  isActive?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.4 : 1,
    width: isHorizontal ? '200px' : '100%',
    position: 'relative',
    flexShrink: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? 'dragging' : ''} ${isHorizontal ? 'horizontal-item' : ''}`}
    >
      <div className="item-content">
        <div className="item-text">{item.content}</div>
        <div 
          className="drag-handle"
          {...attributes}
          {...listeners}
        >
          <DragOutlined />
        </div>
      </div>
    </div>
  );
};

// 行组件
const DroppableRow = ({ 
  row, 
  activeId,
}: { 
  row: Row;
  activeId: string | null;
}) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: row.id,
    data: {
      type: 'row',
      row,
    },
  });

  // 左右边缘触发区域
  const { setNodeRef: setLeftEdgeRef, isOver: isOverLeft } = useDroppable({
    id: `${row.id}-edge-left`,
    data: {
      type: 'row-edge',
      row,
      edge: 'left',
    },
  });
  const { setNodeRef: setRightEdgeRef, isOver: isOverRight } = useDroppable({
    id: `${row.id}-edge-right`,
    data: {
      type: 'row-edge',
      row,
      edge: 'right',
    },
  });

  const sortingStrategy = row.isMultiColumn 
    ? horizontalListSortingStrategy 
    : verticalListSortingStrategy;

  return (
    <div
      ref={setNodeRef}
      className={`droppable-row ${isOver ? 'drop-over' : ''} ${row.isMultiColumn ? 'multi-column' : ''}`}
    >
      {/* 左右边缘触发区域 */}
      <div 
        ref={setLeftEdgeRef} 
        className={`edge-zone left ${isOverLeft ? 'over' : ''}`}
        title="拖拽到左侧边缘分栏"
      />
      <div 
        ref={setRightEdgeRef} 
        className={`edge-zone right ${isOverRight ? 'over' : ''}`}
        title="拖拽到右侧边缘分栏"
      />
      
      <SortableContext 
        items={row.items.map(item => item.id)}
        strategy={sortingStrategy}
      >
        <div className={`row-content ${row.isMultiColumn ? 'horizontal-layout' : 'vertical-layout'}`}>
          {row.items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              item={item}
              isHorizontal={row.isMultiColumn}
              isActive={activeId === item.id}
            />
          ))}
        </div>
      </SortableContext>
      
      {/* 左右边缘触发层，宽度可作为触发阈值 */}
      <div
        ref={setLeftEdgeRef}
        className={`edge-zone left ${isOverLeft ? 'over' : ''}`}
      />
      <div
        ref={setRightEdgeRef}
        className={`edge-zone right ${isOverRight ? 'over' : ''}`}
      />
      
      {isOver && (
        <div className="drop-indicator">
          <div className="drop-line"></div>
        </div>
      )}
    </div>
  );
};

// 主拖拽组件
const EnhancedDnd = () => {
  const [rows, setRows] = useState<Row[]>([
    {
      id: 'row-1',
      items: [
        { id: 'item-1', content: 'Item 1' },
        { id: 'item-2', content: 'Item 2' },
      ],
      isMultiColumn: false,
    },
    {
      id: 'row-2',
      items: [
        { id: 'item-3', content: 'Item 3' },
        { id: 'item-4', content: 'Item 4' },
      ],
      isMultiColumn: true,
    },
    {
      id: 'row-3',
      items: [
        { id: 'item-5', content: 'Item 5' },
        { id: 'item-6', content: 'Item 6' },
      ],
      isMultiColumn: false,
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  // 查找项所在的行
  const findItemRow = (itemId: string) => {
    return rows.find(row => row.items.some(item => item.id === itemId));
  };

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // 找到被拖拽的项
    for (const row of rows) {
      const item = row.items.find(item => item.id === active.id);
      if (item) {
        setDraggedItem(item);
        break;
      }
    }
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // 如果落在左右边缘触发区域，则启用多列并按左右插入
    const isEdgeLeft = /-edge-left$/.test(overId);
    const isEdgeRight = /-edge-right$/.test(overId);
    if (isEdgeLeft || isEdgeRight) {
      const targetRowId = overId.replace(/-edge-(left|right)$/i, '');
      const sourceRow = findItemRow(activeId);
      const targetRow = rows.find(r => r.id === targetRowId);
      if (!sourceRow || !targetRow) {
        setActiveId(null);
        setDraggedItem(null);
        return;
      }

      setRows(prevRows => {
        const newRows = [...prevRows];
        const sourceRowIndex = newRows.findIndex(row => row.id === sourceRow.id);
        const targetRowIndex = newRows.findIndex(row => row.id === targetRow!.id);

        const sourceItemIndex = newRows[sourceRowIndex].items.findIndex(item => item.id === activeId);
        const [movedItem] = newRows[sourceRowIndex].items.splice(sourceItemIndex, 1);

        // 启用多列模式
        newRows[targetRowIndex].isMultiColumn = true;
        if (isEdgeLeft) {
          newRows[targetRowIndex].items.unshift(movedItem);
        } else {
          newRows[targetRowIndex].items.push(movedItem);
        }

        // 如果源行为空，且还有其他行，则删除源行
        if (newRows[sourceRowIndex].items.length === 0 && newRows.length > 1) {
          newRows.splice(sourceRowIndex, 1);
        }
        return newRows;
      });

      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // 查找源行和目标行
    const sourceRow = findItemRow(activeId);
    let targetRow = findItemRow(overId);

    // 如果悬停在一个行上（而不是具体的项）
    if (!targetRow) {
      targetRow = rows.find(row => row.id === overId);
    }

    if (!sourceRow || !targetRow) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    setRows(prevRows => {
      const newRows = [...prevRows];
      
      // 从源行移除项
      const sourceRowIndex = newRows.findIndex(row => row.id === sourceRow.id);
      const sourceItemIndex = newRows[sourceRowIndex].items.findIndex(item => item.id === activeId);
      const [movedItem] = newRows[sourceRowIndex].items.splice(sourceItemIndex, 1);

      // 添加到目标行
      const targetRowIndex = newRows.findIndex(row => row.id === targetRow.id);
      
      if (targetRow.items.some(item => item.id === overId)) {
        // 插入到具体位置
        const targetItemIndex = newRows[targetRowIndex].items.findIndex(item => item.id === overId);
        newRows[targetRowIndex].items.splice(targetItemIndex, 0, movedItem);
      } else {
        // 添加到行末尾
        newRows[targetRowIndex].items.push(movedItem);
      }

      // 如果源行为空，可以选择删除它
      if (newRows[sourceRowIndex].items.length === 0 && newRows.length > 1) {
        newRows.splice(sourceRowIndex, 1);
      }

      return newRows;
    });

    setActiveId(null);
    setDraggedItem(null);
  };

  // 切换行的布局模式
  const toggleRowLayout = (rowId: string) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            isMultiColumn: !row.isMultiColumn,
          };
        }
        return row;
      });
    });
  };

  // 添加新行
  const addNewRow = () => {
    const newRowId = `row-${Date.now()}`;
    setRows(prevRows => [
      ...prevRows,
      {
        id: newRowId,
        items: [],
        isMultiColumn: false,
      },
    ]);
  };

  return (
    <div className="enhanced-dnd-container">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rows-container">
          {rows.map((row) => (
            <div key={row.id} className="row-wrapper">
              <div className="row-header">
                <span className="row-title">
                  {row.isMultiColumn ? '多列布局' : '单列布局'} - {row.items.length} 项
                </span>
                <button
                  className="layout-toggle"
                  onClick={() => toggleRowLayout(row.id)}
                >
                  {row.isMultiColumn ? '切换为单列' : '切换为多列'}
                </button>
              </div>
              
              <DroppableRow
                row={row}
                activeId={activeId}
              />
            </div>
          ))}
          
          <div className="add-row-container">
            <button className="add-row-btn" onClick={addNewRow}>
              <PlusOutlined />
              添加新行
            </button>
          </div>
        </div>

        <DragOverlay>
          {draggedItem ? (
            <div className="drag-overlay">
              <div className="item-content">
                <div className="item-text">{draggedItem.content}</div>
                <div className="drag-handle">
                  <DragOutlined />
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default EnhancedDnd;