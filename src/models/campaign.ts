export interface Campaign {
  id?: number;
  name: string;
  creatorId?: string;
  pageId: string;
  createdAt?: Date;
  startedAt?: Date;
  message: string;
  totalMessages: number;
  successMessages?: number;
  filteredBy?: string;
  status?: string;
  memberUids?: string[];
}

export interface CampaignUpdate {
  id: number;
  [key: string]: string | number | Date;
}
