// types/auth.ts
export interface SignupData {
    name: string;
    email: string;
    password: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
  }
  
  export interface LogoutResponse {
    message: string;
  }