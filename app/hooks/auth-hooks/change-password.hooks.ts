import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { changePasswordSchema } from '../../validators/auth.validator';
import { validateForm } from '../../validators/helpers';

import { ChangePasswordData, ChangePasswordResponse } from '@/app/models/user';
import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '@/app/interceptors/axiosInstance';

const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
  // Validation des données d'entrée
  const { success, errors } = await validateForm(data, changePasswordSchema);
  if (!success) {
    throw new Error(JSON.stringify(errors));
  }



  try {
    const response = await axiosInstance.post<ChangePasswordResponse>(
      `/auth/change-password`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ErrorResponse = error.response.data;
      const message = errorData.errorDetails?.message || 'change password  failed';
      throw new Error(message);
    }
    throw new Error('Changing password failed !!');
  }
};

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordData>({
    mutationFn: changePassword,
  });
};
