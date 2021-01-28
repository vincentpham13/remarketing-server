import { CANCELLED } from "dns";

export enum OrderStatus {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    SUCCESS = 'success',
    COMPLETE = 'complete',
    REJECTED = 'rejected'
}