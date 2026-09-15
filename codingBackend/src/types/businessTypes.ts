export interface productData {
    name: string;
    description: string;
    price: number;
    quantity: number;
    file: Express.Multer.File;
}

export interface businessUpdateData {
    businessName?: string;
    description?: string;
}


export interface productUpdateData {
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
}

export interface businessData {
    businessName: string;
    description: string;
}   

