// store/types.ts

// Interface for data required during user signup
export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Interface for credentials used during user login
export interface LoginData {
  email: string;
  password: string;
}

// Interface for the response returned after a successful login
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

// Interface for error responses from the backend
export interface ErrorResponse {
  error: boolean;
  errorDetails: ErrorDetails;
  timeStamp: string;
}

// Interface for detailed error information within an error response
export interface ErrorDetails {
  statusCode: number;
  message: string;
  error: string;
  code: string;
}

// Interface for data used in transfer, buy, or sell transactions
export interface TransferData {
  amount: string;
  senderAddress: string;
  receiverAddress?: string;
  inputCurrency?: 'USDT' | 'PRX';
}

// Interface for wallet information retrieved from the backend
export interface walletInfoRequest {
  address: string;
  prxBalance: string;
  usdtBalance: string;
}

// Interface for the response returned after a successful logout
export interface LogoutResponse {
  message: string;
}

// Interface for user profile data used in forms
export interface UserFormData {
  name: string;
  email: string;
}

// Interface for data required to change a user's password
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Interface for the response returned after a successful password change
export interface ChangePasswordResponse {
  message: string;
}

// Interface for data used to update a user's profile
export interface UpdateProfileData {
  name: string;
  email: string;
}

// Interface for the response returned after a successful profile update
export interface UpdateProfileResponse {
  userDetails: {
    username: string;
    email: string;
    walletAddress: string;
    prxBalance: number;
    usdtBalance: number;
  };
}

// Interface for user information retrieved from the backend
export interface UserInfo {
  name: string;
  email: string;
  walletAddress: string;
  prxBalance: number;
  usdtBalance: number;
}

// Enum for transaction types (should match TransactionType from your DTO)
export enum TransactionType {
  TRANSFER = 'transfer',
  TRADING = 'trading',
}

// Interface for a single transaction (based on FormattedTransaction from your service)
export interface Transaction {
  type: string;
  amount: number;
  received_amount: number;
  date: string; // ISO date string
  operation?: 'buy' | 'sell';
  sender_id : string
}

// Interface for the API response (based on FindAllByUserResponse)
export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
