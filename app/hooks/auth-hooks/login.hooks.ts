// hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import {  IP_ADDRESS } from '../../models/types';
import { LoginData, LoginResponse } from '@/app/models/auth';
import { ErrorResponse } from '@/app/models/error';

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  console.log(IP_ADDRESS)
  const url = `http://${IP_ADDRESS}:3000/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.status === 201) {
    return res.json(); // Parse the success response with tokens
  } else if (!res.ok) {
    const errorData: ErrorResponse = await res.json();
    throw new Error(errorData.errorDetails?.message || 'Login failed');
  }
  throw new Error('Unexpected response status');
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};