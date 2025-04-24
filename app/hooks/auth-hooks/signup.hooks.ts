// hooks/useSignup.ts
import { useMutation } from '@tanstack/react-query';
import { IP_ADDRESS } from '../../models/types';
import { SignupData } from '@/app/models/auth';


const signupUser = async (data: SignupData): Promise<boolean> => {
  const url = `http://${IP_ADDRESS}:3000/auth/signup`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.status === 201) {
    return true;
  } else if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.errorDetails?.message || 'Signup failed');
  }
  return false;
};

export const useSignup = () => {
  return useMutation({
    mutationFn: signupUser,
  });
};