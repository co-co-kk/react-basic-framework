import React, { useState, useCallback } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOutlined } from '@ant-design/icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import './index.css';

// 定义项的类型
interface Item {
  id: string;
  content: string;
  layoutId?: string; // 所属布局的ID
  layoutIndex?: number; // 在布局中的索引
}

// 定义布局的类型
interface Layout {
  id: string;
  type: 'horizontal'; // 水平布局
  items: string[]; // 存储包含的项ID
}

// 可排序项组件
const SortableItem = ({ 
  id, 
  item,
  isInHorizontalLayout = false,
  disabled = false,
  isActive = false // 添加isActive属性来跟踪拖拽状态
}: { 
  id: string; 
  item: Item;
  isInHorizontalLayout?: boolean;
  disabled?: boolean;
  isActive?: boolean;
}) => {
  // 使用标准的useSortable API
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    // 当拖拽开始时，添加透明度使原始元素变得半透明
    opacity: isActive ? 0.4 : 1,
  };

  // 只有在水平布局中才应用flex: 1样式
  const containerStyle = isInHorizontalLayout ? {
    flex: 1,
    minWidth: 0,
    ...style
  } : style;

  return (
    <div
      ref={setNodeRef}
      style={{ ...containerStyle, position: 'relative' }}
      className={`group ${isInHorizontalLayout ? 'flex-item' : ''} ${isActive ? 'opacity-40' : ''}`}
    >
      <div className="p-6 bg-blue-500 text-white rounded-lg shadow-lg text-center">
        {item.content}
      </div>
      {!disabled && (
        // 拖拽手柄，放在右上角
        <div 
          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 pointer-events-auto"
          title="拖拽移动"
          {...attributes}
          {...listeners}
        >
          <div className="bg-blue-700 w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg hover:bg-blue-800 transition-all duration-300 cursor-move rounded-full">
            <DragOutlined style={{ fontSize: '16px', color: 'white' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// 主拖拽Demo组件
const DndDemo = () => {
  // 所有项的数据
  const [items, setItems] = useState<Record<string, Item>>({
    'item-1': { id: 'item-1', content: 'Item 1' },
    'item-2': { id: 'item-2', content: 'Item 2' },
    'item-3': { id: 'item-3', content: 'Item 3' },
    'item-4': { id: 'item-4', content: 'Item 4' },
  });

  // 所有布局的数据
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});

  // 根级元素的ID列表（可以是项ID或布局ID）
  const [rootIds, setRootIds] = useState<string[]>([
    'item-1', 'item-2', 'item-3', 'item-4'
  ]);

  // 活动项ID（拖拽中的项）
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // 拖拽悬停ID（用于显示放置提示）
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  // 拖拽占位位置
  const [dropPlaceholder, setDropPlaceholder] = useState<{index: number, layoutId?: string} | null>(null);

  // 配置传感器支持鼠标和触摸拖拽
  const sensors = useSensors(
    useSensor(PointerSensor, {}),
    useSensor(TouchSensor)
  );

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // 拖拽悬停
  const handleDragOver = (event: DragOverEvent) => {
    setDragOverId(event.over?.id as string || null);
    
    // 清除之前的占位符
    setDropPlaceholder(null);
    
    if (!event.over) return;
    
    const { active, over } = event;
    const overId = over.id as string;
    const activeId = active.id as string;
    
    // 查找over元素在rootIds中的位置
    const overIndex = rootIds.indexOf(overId);
    const activeIndex = rootIds.indexOf(activeId);
    
    // 如果都在根级且是不同的项
    if (overIndex !== -1 && activeIndex !== -1 && activeId !== overId) {
      // 计算放置位置
      const newIndex = activeIndex < overIndex ? overIndex : overIndex + 1;
      setDropPlaceholder({ index: newIndex });
      return;
    }
    
    // 检查是否在水平布局内
    const activeLayout = getItemLayout(activeId);
    const overLayout = getItemLayout(overId);
    
    // 如果都在同一个水平布局内
    if (activeLayout && overLayout && activeLayout.layoutId === overLayout.layoutId) {
      const layout = layouts[activeLayout.layoutId];
      const overIndexInLayout = layout.items.indexOf(overId);
      const activeIndexInLayout = layout.items.indexOf(activeId);
      
      if (overIndexInLayout !== -1 && activeIndexInLayout !== -1 && activeId !== overId) {
        const newIndex = activeIndexInLayout < overIndexInLayout 
          ? overIndexInLayout 
          : overIndexInLayout + 1;
        setDropPlaceholder({ index: newIndex, layoutId: layout.id });
      }
    }
    
    // 检查是否拖拽到水平布局上
    if (layouts[overId]) {
      const layout = layouts[overId];
      // 默认添加到布局末尾
      setDropPlaceholder({ index: layout.items.length, layoutId: layout.id });
    }
  };

  // 拖拽取消
  const handleDragCancel = () => {
    setActiveId(null);
    setDragOverId(null);
    setDropPlaceholder(null);
  };

  // 检查项是否在布局中
  const getItemLayout = useCallback((itemId: string): { layoutId: string; index: number } | null => {
    for (const [layoutId, layout] of Object.entries(layouts)) {
      const index = layout.items.indexOf(itemId);
      if (index !== -1) {
        return { layoutId, index };
      }
    }
    return null;
  }, [layouts]);

  // 从布局中移除项
  const removeItemFromLayout = useCallback((itemId: string) => {
    const layoutInfo = getItemLayout(itemId);
    if (!layoutInfo) return -1;

    const { layoutId, index } = layoutInfo;
    const layout = layouts[layoutId];
    const newItems = [...layout.items];
    newItems.splice(index, 1);

    // 找到布局在根级的位置
    const layoutRootIndex = rootIds.indexOf(layoutId);

    // 如果布局中还有项，则更新布局
    if (newItems.length > 1) {
      setLayouts(prev => ({
        ...prev,
        [layoutId]: {
          ...layout,
          items: newItems
        }
      }));
    } else {
      // 删除布局
      setLayouts(prev => {
        const newLayouts = { ...prev };
        delete newLayouts[layoutId];
        return newLayouts;
      });

      // 如果布局在根级，移除布局
      if (layoutRootIndex !== -1) {
        setRootIds(prev => {
          const newRootIds = [...prev];
          newRootIds.splice(layoutRootIndex, 1);
          return newRootIds;
        });

        // 如果布局中还有一项，将其添加到根级
        if (newItems.length === 1 && newItems[0] !== itemId) {
          setRootIds(prev => {
            const newRootIds = [...prev];
            newRootIds.splice(layoutRootIndex, 0, newItems[0]);
            return newRootIds;
          });
          
          // 更新剩余项的布局信息
          setItems(prev => ({
            ...prev,
            [newItems[0]]: {
              ...prev[newItems[0]],
              layoutId: undefined,
              layoutIndex: undefined
            }
          }));
        }
      }
    }

    // 只更新项的布局信息，不再在此处添加到根级（避免重复添加）
    setItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        layoutId: undefined,
        layoutIndex: undefined
      }
    }));

    return layoutRootIndex; // 返回布局在根级的位置
  }, [layouts, rootIds, getItemLayout]);

  // 创建水平布局
  const createHorizontalLayout = useCallback((itemId1: string, itemId2: string, insertIndex: number) => {
    // 创建新布局ID
    const layoutId = `layout-${Date.now()}`;
    
    // 创建新布局
    const newLayout: Layout = {
      id: layoutId,
      type: 'horizontal',
      items: [itemId1, itemId2]
    };

    // 首先从任何现有布局中移除这两个项
    removeItemFromLayout(itemId1);
    removeItemFromLayout(itemId2);
    
    // 创建新的根级ID列表，确保两个项都被移除并添加布局
    setRootIds(prev => {
      // 移除两个项（如果在根级）
      const newRootIds = prev.filter(id => id !== itemId1 && id !== itemId2);
      // 在指定位置插入新布局
      const updatedRootIds = [...newRootIds];
      // 计算正确的插入位置
      // 找到两个项中较前的那个位置作为插入点
      const item1Index = prev.indexOf(itemId1);
      const item2Index = prev.indexOf(itemId2);
      const actualInsertIndex = item1Index !== -1 && item2Index !== -1 
        ? Math.min(item1Index, item2Index)
        : (item1Index !== -1 ? item1Index : (item2Index !== -1 ? item2Index : insertIndex));
      
      updatedRootIds.splice(actualInsertIndex, 0, layoutId);
      return updatedRootIds;
    });
    
    // 更新布局状态
    setLayouts(prev => ({
      ...prev,
      [layoutId]: newLayout
    }));
    
    // 更新项的布局信息
    setItems(prev => ({
      ...prev,
      [itemId1]: {
        ...prev[itemId1],
        layoutId,
        layoutIndex: 0
      },
      [itemId2]: {
        ...prev[itemId2],
        layoutId,
        layoutIndex: 1
      }
    }));
  }, [removeItemFromLayout]);

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverId(null);
    setDropPlaceholder(null);

    // 如果没有over或者over就是自己，不做处理
    if (!over || active.id === over.id) {
      // 如果从布局中拖拽出来但没有放置目标，确保项被添加到根级
      const activeId = active.id as string;
      const activeItem = items[activeId];
      const activeLayout = getItemLayout(activeId);
      
      // 如果是从布局中拖出且没有放置目标，确保添加到根级
      if (activeItem && activeLayout && !rootIds.includes(activeId)) {
        // 从布局中移除项
        const layoutIndex = removeItemFromLayout(activeId);
        
        // 确保项在根级
        if (!rootIds.includes(activeId)) {
          setRootIds(prev => {
            const newRootIds = [...prev];
            const insertIndex = layoutIndex !== -1 ? layoutIndex + 1 : newRootIds.length;
            newRootIds.splice(insertIndex, 0, activeId);
            return newRootIds;
          });
        }
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // 检查是否都是项（不是布局）
    const isActiveItem = items[activeId] !== undefined;
    const isOverItem = items[overId] !== undefined;
    
    if (!isActiveItem) return; // 只处理项的拖拽

    // 获取活动项和over项的布局信息
    const activeLayout = getItemLayout(activeId);
    const overLayout = getItemLayout(overId);

    // 情况1: 两个项在同一个布局中 - 交换位置
    if (activeLayout && overLayout && activeLayout.layoutId === overLayout.layoutId) {
      const layout = layouts[activeLayout.layoutId];
      const newItems = [...layout.items];
      
      // 交换位置
      const temp = newItems[activeLayout.index];
      newItems[activeLayout.index] = newItems[overLayout.index];
      newItems[overLayout.index] = temp;
      
      setLayouts(prev => ({
        ...prev,
        [layout.id]: {
          ...layout,
          items: newItems
        }
      }));
      
      // 更新项的布局索引
      setItems(prev => ({
        ...prev,
        [activeId]: {
          ...prev[activeId],
          layoutIndex: overLayout.index
        },
        [overId]: {
          ...prev[overId],
          layoutIndex: activeLayout.index
        }
      }));
      return;
    }

    // 检查是否是拖到根级元素上（可能是布局或项）
    const isOverRootElement = rootIds.includes(overId);
    
    // 对于根级项，区分位置交换和布局创建
    if (isOverItem && !activeLayout && !overLayout && isOverRootElement) {
      // 只有当拖拽到目标元素上足够长时间或有足够的重叠才创建水平布局
      // 这里我们使用一个更严格的条件来避免意外创建布局
      
      // 从event中获取拖拽的位置信息
      const activeRect = active.rect.current.translated;
      const overRect = over.rect.current;
      
      if (activeRect && overRect) {
        // 计算两个元素的重叠区域
        const overlapLeft = Math.max(activeRect.left, overRect.left);
        const overlapRight = Math.min(activeRect.right, overRect.right);
        const overlapTop = Math.max(activeRect.top, overRect.top);
        const overlapBottom = Math.min(activeRect.bottom, overRect.bottom);
        
        // 计算重叠区域的面积
        const overlapWidth = Math.max(0, overlapRight - overlapLeft);
        const overlapHeight = Math.max(0, overlapBottom - overlapTop);
        const overlapArea = overlapWidth * overlapHeight;
        
        // 计算over元素的面积
        const overArea = overRect.width * overRect.height;
        
        // 只有当重叠面积占over元素面积的70%以上时才创建水平布局
        // 这样可以避免意外创建布局
        if (overlapArea > overArea * 0.7) {
          // 创建水平布局
          const overRootIndex = rootIds.indexOf(overId);
          createHorizontalLayout(activeId, overId, overRootIndex);
        } else {
          // 执行位置交换
          const activeRootIndex = rootIds.indexOf(activeId);
          const overRootIndex = rootIds.indexOf(overId);
          
          if (overRootIndex !== -1) {
            // 创建新的根级ID列表，确保活动项被正确移动而不是复制
            setRootIds(prev => {
              // 先移除活动项（如果在根级）
              const newRootIds = prev.filter(id => id !== activeId);
              
              // 计算插入位置
              const adjustedIndex = activeRootIndex < overRootIndex && activeRootIndex !== -1 
                ? overRootIndex - 1 
                : overRootIndex;
              
              // 在目标位置插入活动项
              const result = [...newRootIds];
              result.splice(adjustedIndex, 0, activeId);
              return result;
            });
          }
        }
      } else {
        // 如果无法获取位置信息，默认执行位置交换而不是创建布局
        const activeRootIndex = rootIds.indexOf(activeId);
        const overRootIndex = rootIds.indexOf(overId);
        
        if (overRootIndex !== -1) {
          // 创建新的根级ID列表，确保活动项被正确移动而不是复制
          setRootIds(prev => {
            // 先移除活动项（如果在根级）
            const newRootIds = prev.filter(id => id !== activeId);
            
            // 计算插入位置
            const adjustedIndex = activeRootIndex < overRootIndex && activeRootIndex !== -1 
              ? overRootIndex - 1 
              : overRootIndex;
            
            // 在目标位置插入活动项
            const result = [...newRootIds];
            result.splice(adjustedIndex, 0, activeId);
            return result;
          });
        }
      }
      return;
    }

    // 情况3: 拖拽项到布局中的项上 - 替换该项
    if (isOverItem && overLayout) {
      // 从原布局中移除活动项（如果在布局中）
      if (activeLayout) {
        removeItemFromLayout(activeId);
      }
      
      // 从根级移除活动项（如果在根级）
      setRootIds(prev => prev.filter(id => id !== activeId));
      
      // 将活动项添加到目标布局
      const layout = layouts[overLayout.layoutId];
      const newLayoutItems = [...layout.items];
      const replacedItemId = newLayoutItems[overLayout.index];
      newLayoutItems[overLayout.index] = activeId;
      
      setLayouts(prev => ({
        ...prev,
        [layout.id]: {
          ...layout,
          items: newLayoutItems
        }
      }));
      
      // 更新活动项的布局信息
      setItems(prev => ({
        ...prev,
        [activeId]: {
          ...prev[activeId],
          layoutId: layout.id,
          layoutIndex: overLayout.index
        },
        [replacedItemId]: {
          ...prev[replacedItemId],
          layoutId: undefined,
          layoutIndex: undefined
        }
      }));
      
      // 将被替换的项添加到根级
      const layoutRootIndex = rootIds.indexOf(layout.id);
      if (layoutRootIndex !== -1) {
        setRootIds(prev => {
          const newRootIds = [...prev];
          // 确保不会重复添加
          if (!newRootIds.includes(replacedItemId)) {
            newRootIds.splice(layoutRootIndex + 1, 0, replacedItemId);
          }
          return newRootIds;
        });
      } else if (!rootIds.includes(replacedItemId)) {
        // 如果布局不在根级，将被替换的项添加到根级末尾
        setRootIds(prev => [...prev, replacedItemId]);
      }
      return;
    }

    // 情况4: 拖拽项到水平布局上 - 添加到布局中
    if (layouts[overId]) {
      // 从根级移除活动项（如果在根级）
      setRootIds(prev => prev.filter(id => id !== activeId));
      
      // 从任何现有布局中移除活动项
      if (activeLayout) {
        removeItemFromLayout(activeId);
      }
      
      // 将活动项添加到目标布局末尾
      const layout = layouts[overId];
      const newLayoutItems = [...layout.items, activeId];
      
      setLayouts(prev => ({
        ...prev,
        [layout.id]: {
          ...layout,
          items: newLayoutItems
        }
      }));
      
      // 更新活动项的布局信息
      setItems(prev => ({
        ...prev,
        [activeId]: {
          ...prev[activeId],
          layoutId: layout.id,
          layoutIndex: newLayoutItems.length - 1
        }
      }));
      return;
    }

    // 情况5: 拖拽项到根级位置 - 移动到该位置
    const activeRootIndex = rootIds.indexOf(activeId);
    const overRootIndex = rootIds.indexOf(overId);
    
    if (overRootIndex !== -1) {
      // 如果活动项在布局中，先从布局中移除
      if (activeLayout) {
        removeItemFromLayout(activeId);
      }
      
      // 创建新的根级ID列表，确保活动项被正确移动而不是复制
      setRootIds(prev => {
        // 先移除活动项（如果在根级）
        const newRootIds = prev.filter(id => id !== activeId);
        
        // 计算插入位置
        const adjustedIndex = activeRootIndex < overRootIndex && activeRootIndex !== -1 
          ? overRootIndex - 1 
          : overRootIndex;
        
        // 在目标位置插入活动项
        const result = [...newRootIds];
        result.splice(adjustedIndex, 0, activeId);
        return result;
      });
      
      // 更新项的布局信息
      setItems(prev => ({
        ...prev,
        [activeId]: {
          ...prev[activeId],
          layoutId: undefined,
          layoutIndex: undefined
        }
      }));
    }
  };

  // 渲染元素（项或布局）
  const renderElement = (id: string, index: number) => {
    // 检查是否需要显示占位符
    if (dropPlaceholder && dropPlaceholder.index === index && !dropPlaceholder.layoutId) {
      return (
        <React.Fragment key={`placeholder-${index}`}>
          <div className="drop-placeholder mb-4" />
          {renderActualElement(id)}
        </React.Fragment>
      );
    }
    
    return (
      <React.Fragment key={id}>
        {renderActualElement(id)}
      </React.Fragment>
    );
  };
  
  // 渲染实际元素
  const renderActualElement = (id: string) => {
    // 检查是否是布局
    const layout = layouts[id];
    if (layout) {
      // 查找布局内的占位符位置
      const layoutItemsWithPlaceholders = [];
      
      // 先添加可能在开头的占位符
      if (dropPlaceholder && dropPlaceholder.layoutId === layout.id && dropPlaceholder.index === 0) {
        layoutItemsWithPlaceholders.push(
          <div key="placeholder-start" className="drop-placeholder" style={{ height: '60px', margin: '6px' }} />
        );
      }
      
      layout.items.forEach((itemId, index) => {
        // 添加当前项
        layoutItemsWithPlaceholders.push(renderItemElement(itemId));
        
        // 检查是否需要在当前项后添加占位符
        if (dropPlaceholder && dropPlaceholder.layoutId === layout.id && dropPlaceholder.index === index + 1) {
          layoutItemsWithPlaceholders.push(
            <div key={`placeholder-${index}`} className="drop-placeholder" style={{ height: '60px', margin: '6px' }} />
          );
        }
      });
      
      return (
        <div 
          key={id} 
          className={`mb-4 ${dragOverId === id ? 'drag-over' : ''}`}
        >
          <PanelGroup direction="horizontal" className="w-full">
            {layoutItemsWithPlaceholders.map((item, index) => (
              <React.Fragment key={index}>
                {index % 2 === 0 ? (
                  <Panel 
                    defaultSize={100 / layoutItemsWithPlaceholders.filter((_, i) => i % 2 === 0).length}
                    minSize={10}
                  >
                    <div className="h-full">
                      {item}
                    </div>
                  </Panel>
                ) : (
                  item
                )}
                {index < layoutItemsWithPlaceholders.length - 1 && index % 2 === 0 && (
                  <PanelResizeHandle className="panel-resize-handle" />
                )}
              </React.Fragment>
            ))}
          </PanelGroup>
        </div>
      );
    }

    // 否则渲染单个项
    return renderItemElement(id);
  };
  
  // 渲染单个项元素
  const renderItemElement = (id: string) => {
    const item = items[id];
    if (!item) return null;

    return (
      <div 
        key={id} 
        className={`mb-4 ${dragOverId === id ? 'drag-over' : ''}`}
      >
        <SortableItem
          id={id}
          item={item}
          disabled={false}
          isActive={activeId === id} // 传递拖拽状态
        />
      </div>
    );
  };

  // 渲染拖拽覆盖层
  const renderDragOverlay = () => {
    if (!activeId || !items[activeId]) return null;
    
    const item = items[activeId];
    
    // 获取当前项是否在水平布局中
    const isInHorizontalLayout = !!getItemLayout(activeId);
    
    return (
      <div 
        className={`p-6 bg-blue-500 text-white rounded-lg shadow-lg text-center w-full transition-all duration-200 ease transform`}
        style={{
          // 根据是否在水平布局中设置适当的最小宽度
          minWidth: isInHorizontalLayout ? '200px' : '300px',
          // 添加轻微的缩放和阴影增强拖拽视觉效果
          transform: 'scale(1.02)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {item.content}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">灵活拖拽布局Demo</h1>
      <p className="text-center mb-6 text-gray-600">
        1. 悬停在卡片上显示拖拽手柄<br/>
        2. 拖拽可以交换任何项的位置<br/>
        3. 将一个项拖到另一个项上形成左右布局<br/>
        4. 左右布局中的每个项都可以独立拖动和交换位置<br/>
        5. 左右布局中可以通过拖拽中间的分隔线调整列宽
      </p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-4">
          {rootIds.map((id, index) => renderElement(id, index))}
        </div>

        {/* 拖拽时的覆盖层 */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">布局状态</h3>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-auto">
          {JSON.stringify({ items, layouts, rootIds }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DndDemo;