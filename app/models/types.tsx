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




// this will be the response when a login backend  error occures 
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



// Define the type for the transfer api (send buy sell ) for all the transction API's
export interface TransferData {
  amount: string;
  senderAddress: string;
  receiverAddress?: string;
  inputCurrency?: 'USDT' | 'PRX'; // New field is optional for the transfer operations
}


//this type is used for the response of  whene t fetching the wallet info
export interface walletInfoRequest {
  address: string,
  prxBalance: string,
  usdtBalance: string
}


