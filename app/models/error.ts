// types/error.ts
// src/app/models/error.ts
export interface ErrorResponse {
    error: boolean;
    errorDetails: {
      statusCode: number;
      message: string;
      error: string;
      code: string;
    };
    timeStamp: string;
  }
  export interface ErrorDetails {
    statusCode: number;
    message: string;
    error: string;
    code: string;
  }