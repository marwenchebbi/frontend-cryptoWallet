// hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';

import { LoginData, LoginResponse, ErrorResponse } from '../../models/types';

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const url = 'http://192.168.1.14:3000/auth/login';
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