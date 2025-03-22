// store/types.ts
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

export interface ErrorDetails {
  statusCode: number;
  message: string;
  error: string;
  code: string;
}

export interface ErrorResponse {
  error: boolean;
  errorDetails: ErrorDetails;
  timeStamp: string;
}