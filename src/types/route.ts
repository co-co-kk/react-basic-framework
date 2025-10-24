export interface RouteItem {
  id: string;
  parentId: string;
  menuName: string;
  menuCode: string;
  icon: string;
  type: number;
  routePath: string;
  urlAddress: string;
  isEnable: number;
  sortValue: number;
  children: RouteItem[] | null;
  checked: number;
  lastChildren: boolean;
}