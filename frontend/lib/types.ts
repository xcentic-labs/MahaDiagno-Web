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