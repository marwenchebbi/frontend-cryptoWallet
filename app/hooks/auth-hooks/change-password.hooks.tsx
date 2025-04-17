import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { changePasswordSchema } from '../../validators/auth.validator';
import { validateForm } from '../../validators/helpers';
import { ChangePasswordData, ChangePasswordResponse } from '@/app/models/types';




const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
  // Validate input using changePasswordSchema
  const { success, errors } = await validateForm(data, changePasswordSchema);
  if (!success) {
    throw new Error(JSON.stringify(errors));
  }

  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch('http://192.168.11.38:3000/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errorDetails?.message || `Failed to change password: ${response.status}`);
  }

  return response.json();
};

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordData>({
    mutationFn: changePassword,
  });
};