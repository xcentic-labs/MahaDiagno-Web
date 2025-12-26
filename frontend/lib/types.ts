export interface Login{
    email : string,
    password : string
}

export interface Specialization {
    id: number;
    key: string;
    label: string;
    imageUrl: string;
}

export interface SpecializationResponse {
    success: boolean;
    message: string;
    specializations: Specialization[];
}

export interface CreateSpecializationRequest {
    image: File;
    key: string;
    label: string;
}

export interface MedicineCategory {
    id: number;
    name: string;
    imageUrl: string;
}

export interface MedicineCategoryResponse {
    success: boolean;
    message: string;
    data: MedicineCategory[];
}

export interface SingleMedicineCategoryResponse {
    success: boolean;
    message: string;
    data: MedicineCategory;
}