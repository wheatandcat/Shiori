export type ItemDetail = {
  title: string;
  kind: string;
  memo: string;
  place: string;
  url: string;
  moveMinutes: number;
  priority: number;
};

export type UpdateItemDetail = ItemDetail & {
  id: string | number;
  itemId: string | number;
};
