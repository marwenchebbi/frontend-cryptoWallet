import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { profileSchema } from '../../validators/auth.validator';
import { validateForm } from '../../validators/helpers';
import { UpdateProfileData, UpdateProfileResponse } from '@/app/models/types';


const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  // Validate input using profileSchema
  const { success, errors } = await validateForm(data, profileSchema);
  if (!success) {
    throw new Error(JSON.stringify(errors)); // Pass validation errors
  }

  
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch('http://192.168.11.38:3000/auth/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errorDetails?.message || `Failed to update profile: ${response.status}`);
  }

  return response.json();
};

export const useUpdateProfile = () => {
  return useMutation<UpdateProfileResponse, Error, UpdateProfileData>({
    mutationFn: updateProfile,
  });
};  