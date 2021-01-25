export interface Campaign {
  id?: number;
  name: string;
  creatorId?: string;
  pageId: string;
  createdAt?: Date;
  totalMessages: number;
  successMessages?: number;
  filteredBy?: string;
  status?: string;
}

export interface CampaignUpdate {
  id: number;
  [key: string]: string | number;
}
