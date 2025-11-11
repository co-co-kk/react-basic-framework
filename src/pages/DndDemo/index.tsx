import EnhancedDnd from '../../components/Dnd/EnhancedDnd';

export default function DndDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            增强版拖拽组件演示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            支持多行布局、垂直拖拽排序、水平拖拽分组、列宽调整等功能的拖拽组件
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              功能说明
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>垂直拖拽：在同一行内上下拖动改变顺序</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>水平拖拽：拖动到其他行实现分组功能</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>布局切换：点击按钮切换单行/多列模式</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>列宽调整：在多列模式下拖拽右侧边缘调整宽度</span>
              </div>
            </div>
          </div>
          
          <EnhancedDnd />
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            技术特点
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• 使用 @dnd-kit 实现高性能拖拽</li>
            <li>• 支持响应式设计，移动端友好</li>
            <li>• 丰富的视觉反馈和动画效果</li>
            <li>• 可扩展的架构设计</li>
          </ul>
        </div>
      </div>
    </div>
  );
}