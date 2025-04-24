// types/error.ts
export interface ErrorResponse {
    error: boolean;
    errorDetails: ErrorDetails;
    timeStamp: string;
  }
  
  export interface ErrorDetails {
    statusCode: number;
    message: string;
    error: string;
    code: string;
  }