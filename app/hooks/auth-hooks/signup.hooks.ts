// hooks/useSignup.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { SignupData } from '@/app/models/auth';
import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '@/app/interceptors/axiosInstance';

const signupUser = async (data: SignupData): Promise<boolean> => {
  const IP_ADDRESS = process.env.EXPO_PUBLIC_IP_ADDRESS
  const url = `http://${IP_ADDRESS}:3000/auth/signup`;

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      return true;
    } else {
      throw new Error('Unexpected response status');
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ErrorResponse = error.response.data;
      const message = errorData.errorDetails?.message || 'Signup failed';
      throw new Error(message);
    }
    throw new Error('Signup failed');
  }
};

export const useSignup = () => {
  return useMutation<boolean, Error, SignupData>({
    mutationFn: signupUser,
  });
};
