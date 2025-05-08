// types/user.ts
export interface UserFormData {
    name: string;
    email: string;
  }
  
  export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
  }
  
  export interface ChangePasswordResponse {
    message: string;
  }
  
  export interface UpdateProfileData {
    name: string;
    email: string;
  }
  
  export interface UpdateProfileResponse {
    userDetails: {
      username: string;
      email: string;
      walletAddress: string;
      prxBalance: number;
      usdtBalance: number;
    };
  }
  
  export interface UserInfo {
    name: string;
    email: string;
    walletAddress: string;
    prxBalance: number;
    usdtBalance: number;
    isWalletLocked : boolean
  }