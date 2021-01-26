export interface UserPlan {
    userId: string;
    packageId: number;
    remainingMessage: number;
    validTo: Date;
}