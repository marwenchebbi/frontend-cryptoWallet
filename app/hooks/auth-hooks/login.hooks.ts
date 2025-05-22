// hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { IP_ADDRESS } from '../../models/types';
import { LoginData, LoginResponse } from '@/app/models/auth';
import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '@/app/interceptors/axiosInstance';
import axios from 'axios';

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  console.log(IP_ADDRESS);
  const url = `http://${IP_ADDRESS}:3000/auth/login`;
  console.log(url)

  try {
    const response = await axios.post<LoginResponse>(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error('Unexpected response status');
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ErrorResponse = error.response.data;
      const message = errorData.errorDetails?.message || 'Login failed';
      
      throw new Error(message);
      
    }
    throw new Error('Login failed');
  }
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: loginUser,
  });
};
