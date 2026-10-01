const API_URL = import.meta.env.VITE_BACKEND_URL;

export const apiRequest = async(
    endpoint:string,
    options:any={}
)=>{
    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            headers:{
                "Content-Type":"application/json"
            },
            ...options
        }
    );

    return response.json();
};