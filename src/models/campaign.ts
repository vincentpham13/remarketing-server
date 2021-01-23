export interface Campaign {
  name: string;
  createdAt: Date;
  creatorId: string;
  pageId: string;
  totalMessages: number;
  successMessages?: number;
  filteredBy?: string;
  status: string
}
