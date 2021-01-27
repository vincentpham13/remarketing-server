export interface Package {
    id: number;
    label: string;
    dayDuration: number;
    monthDuration: number;
    messageAmount: number;
    price: number;
    status?: string;
}

export interface PackageCreate {
    label: string;
    dayDuration?: number;
    monthDuration?: number;
    messageAmount?: number;
    price: number;
}
