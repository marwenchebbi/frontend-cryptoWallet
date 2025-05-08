// hooks/auth-hooks/useEmailVerification.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { IP_ADDRESS } from '@/app/models/types';
import axiosInstance from '@/app/interceptors/axiosInstance';

interface VerifyEmailResponse {
  message: string;
}

interface VerifyEmailData {
  token: string;
}

const verifyEmail = async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
  const response = await axiosInstance.get(`/auth/verify-email`, {
    params: { token: data.token },
  });
  return response.data;
};

export const useEmailVerification = () => {
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.errorDetails?.message || 'Failed to verify email');
    },
  });

  return {
    verifyEmail: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    verifyError: error,
  };
};