import axios from "@/request/index";
export const thinkForm = async (val) => {

const newData = {
  "messages": [
    {
      "content": "# 低代码表单 JSON 规范参考\n\n使用本规范生成标准化的低代码表单。模型在生成时仅输出合法 JSON，不包含任何解释或额外文本。\n\n## 生成要求\n- 仅输出合法 JSON 字符串，不包含解释、Markdown、注释或多余文本\n\n1. 页面为一个组件树数组。\n2. 每个组件必须包含：\n   - componentName（组件名）\n   - id（唯一ID）\n   - props（属性对象）\n   - children（子组件数组或空数组）\n3. 保持属性命名一致，驼峰格式。\n4. 所有文本用 NextText 组件；所有表单字段在 Form.Item 中。\n5. 输出必须是合法 JSON，可直接渲染。\n6. 示例：\n```\n[\n  {\n    \"componentName\": \"Card\",\n    \"id\": \"node_lvform_root\",\n    \"props\": { \"title\": \"申请表\" },\n    \"children\": [\n      {\n        \"componentName\": \"Form\",\n        \"props\": {},\n        \"children\": [\n          {\n            \"componentName\": \"Form.Item\",\n            \"props\": { \"label\": \"姓名\" },\n            \"children\": [\n              { \"componentName\": \"Input\", \"props\": { \"placeholder\": \"请输入姓名\" } }\n            ]\n          }\n        ]\n      }\n    ]\n  }\n]\n```",
      "role": "system"
    },
    {
      "content": val || "创建一个请假申请表",
      "role": "user"
    }
  ],
  "model": "deepseek-chat",
  "frequency_penalty": 0,
  "max_tokens": 4096,
  "presence_penalty": 0,
  "response_format": {
    "type": "text"
  },
  "stop": null,
  "stream": false,
  "stream_options": null,
  "temperature": 1,
  "top_p": 1,
  "tools": null,
  "tool_choice": "none",
  "logprobs": false,
  "top_logprobs": null
}
    // return await axios.post(`/think/form`, data)
    return await axios.post(`/chat/completions`, newData)
};
// export const getClassifyListApi = async (data) => {
//     return await axios.get(`/api/assistant/v1/assistant_type/list`, data)
// };
// "stream": false,
// 联想的接口
export const getAssistantApi = async (data) => {
  return await axios.post(`/api/form-fields`, data)
  // return await axios.post(`/api/health`, data)
};
