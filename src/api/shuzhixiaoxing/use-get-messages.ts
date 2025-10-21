
import api from '@/api/index';

// 删除卡片
export const deleteCollect = async (id) => {
  return await api.delete<any>(`/api/flow/v1/collect/${id}`);
};

// 查询卡片
export const getCollect = async (prams) => {
  return await api.get<any>(`/api/flow/v1/collect/get_list?name=${prams.name}`, );
};

//添加收藏
export const addGetCollect = async (data) => {
  return await api.post<any>(`/api/flow/v1/collect/add`, data);
};

//助手分类列表
export const assistantTypeList = async () => {
  return await api.get<any>(`/api/flow/v1/assistant_type/list`);
};

//删除历史 (null)
export const deleteChat = async (id) => {
  return await api.delete<any>(`/api/flow/v1/chat/delete/${id}`);
};

//删除历史记录接口
export const remove_chat_by_id = async (id, types) => {
  return await api.delete<any>(
    `/api/flow/v1//collect/assistant/remove_chat_by_id?id=${id}&types=${types}`
  );
};

//助手分类id 查助手列表
export const list_by_type_id = async (folder_id) => {
  return await api.get<any>(
    `/api/flow/v1/collect/assistant/list_by_type_id?folder_id=${folder_id}`
  );
};

// 查询助手分类
export const assistantList = async (name) => {
  return await api.get<any>(
    `/api/flow/v1/collect/assistant/list?name=${name}`
  );
};

//根据流程分类查询列表
export const foldersList = async (id, search) => {
  return await api.get<any>(
    `/api/xingflow/v1/projects/${id}?id=${id}&page=1&size=100&is_component=false&is_flow=true&search=${search}`
  );
};
