import HttpClient from './index.ts';

import type { ListParams, ListModel } from './model/user-model';

export const getList = (params: ListParams) => {
  return HttpClient.get<ListModel>('/list', { params });
};
