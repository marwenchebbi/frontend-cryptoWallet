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


// this will be the response when a backend  error occures 
export interface ErrorResponse {
  error: boolean;
  errorDetails: ErrorDetails;
  timeStamp: string;
}



// Define the type for the transfer data
export interface TransferData {
  amount: string;
  senderAddress: string;
  receiverAddress?: string;
  inputCurrency?: 'USDT' | 'PRX'; // New field is optional for the transfer operations
}

export interface walletInfoRequest {
    address : string,
    prxBalance : string,
    usdtBalance : string
}


