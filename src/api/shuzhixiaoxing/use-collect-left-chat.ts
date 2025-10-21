// import { useMutationFunctionType } from "@/types/api";
import api from '@/api/index';
// import { getURL } from "../constants";
// import { UseRequestProcessor } from "@/controllers/API/services/request-processor";

//历史会话接口
export const useCollectLeftChat = (options) => {
  // const { mutate } = UseRequestProcessor();

  // const collectLeftChat = async (name): Promise<any> => {
  //   const res = await api.get<any>(`${getURL("COLLECTLEFTCHAT")}?name=${name}`);
  //   return res?.data;
  // };

  // const mutation = mutate(["useCollectLeftChat"], collectLeftChat, options);

  return 'mutation';
};
