export interface FanPage {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Member {
  id?: string;
  uid: string;
  name: string;
  pageId: string;
  tags?: string[];
}
