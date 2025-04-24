import * as SecureStore from 'expo-secure-store';


export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await SecureStore.getItemAsync('userId');
  const token = await SecureStore.getItemAsync('accessToken');
  console.log(userId,token)
  return !!(userId && token);
};