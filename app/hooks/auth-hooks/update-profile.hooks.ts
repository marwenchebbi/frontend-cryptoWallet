import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { profileSchema } from '../../validators/auth.validator';
import { validateForm } from '../../validators/helpers';
import { UpdateProfileData, UpdateProfileResponse } from '@/app/models/user';
import axios from 'axios';
import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '@/app/interceptors/axiosInstance';

const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  // Validation du formulaire avec profileSchema
  const { success, errors } = await validateForm(data, profileSchema);
  if (!success) {
    throw new Error(JSON.stringify(errors));
  }



  try {
    const response = await axiosInstance.put<UpdateProfileResponse>(
      `/auth/me`,
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
      const message = errorData.errorDetails?.message || 'Failed to update profile';
      throw new Error(message);
    }
    throw new Error('Failed to update profile');
  }
};

export const useUpdateProfile = () => {
  return useMutation<UpdateProfileResponse, Error, UpdateProfileData>({
    mutationFn: updateProfile,
  });
};
