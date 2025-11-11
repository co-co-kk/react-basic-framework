import { useState } from 'react';
import { getAssistantApi } from '@/api/ai';

export default function AiChat() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    try {
      setLoading(true);

      // 添加用户消息到聊天记录
      const userMessage = { role: 'user', content: inputValue };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // 清空输入框
      setInputValue('');

      // 调用API获取助手回复
      const response = await getAssistantApi({ input: inputValue });

      // 添加助手消息到聊天记录
      const assistantMessage = { role: 'assistant', content: response };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong.' };
      setMessages([...messages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="font-bold mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div>{message.content}</div>
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-lg bg-gray-200 text-gray-800 max-w-[80%]">
              <div className="font-bold mb-1">Assistant</div>
              <div>Thinking...</div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 border rounded-lg p-2 resize-none"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
