
//this component is used to connect to trello account its handle the auth to trello account
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';


const IP_ADDRESS = process.env.EXPO_PUBLIC_IP_ADDRESS

// SOLUTION 1: Utiliser l'URL scheme d'Expo Go
const getExpoGoRedirectUri = () => {

  // Pour Expo Go, utilisez cette URL
  console.log(Linking.createURL('/screens/settings.screen'))
  return Linking.createURL('/screens/settings.screen');
};

// Trello OAuth Configuration
const TRELLO_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_TRELLO_API_KEY || '', // Remplacez par votre clé API Trello
  appName: 'Proxym', // Nom de votre application
  // SOLUTION 1: Utilisez cette ligne pour Expo Go
  redirectUri: getExpoGoRedirectUri(),
  // SOLUTION 2: Ou utilisez une URL web
  // redirectUri: 'https://your-domain.com/auth/trello/callback',
  authUrl: 'https://trello.com/1/authorize',
  apiUrl: 'https://api.trello.com/1'
};

// Configuration de votre API
const API_CONFIG = {
  baseUrl: `http://${IP_ADDRESS}:3000/auth/store-trello-token`,
};

interface TokenData {
  token: string;
  expires?: string;
}

interface TrelloOAuthButtonProps {
  onSuccess?: (tokenData: TokenData) => void;
  onError?: (error: string) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
  scope?: string; // read, write, account
  expiration?: string; // 1hour, 1day, 30days, never
}

const TrelloOAuthButton: React.FC<TrelloOAuthButtonProps> = ({ 
  onSuccess, 
  onError, 
  style, 
  textStyle, 
  loadingColor = '#fff',
  scope = 'read,write',
  expiration = '30days'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const extractTokenFromUrl = (url: string): string | null => {
    const match = url.match(/token=([^&]+)/);
    return match ? match[1] : null;
  };

  const storeTrelloTokenToDatabase = async (token: string): Promise<TokenData> => {
    try {
      // Récupérer le token d'authentification de l'utilisateur
      const userToken = await SecureStore.getItemAsync('accessToken');
      
      if (!userToken) {
        throw new Error('User not authenticated');
      }

      console.log('Calling API:', API_CONFIG.baseUrl);
      console.log('Request payload:', { token });

      // Appeler votre endpoint pour stocker le token Trello
      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          token: token,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Essayer de lire le texte de la réponse pour debug
        const responseText = await response.text();
        console.log('Error response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Essayer de lire la réponse
      const responseText = await response.text();
      console.log('Success response text:', responseText);

      // Si la réponse est vide, c'est probablement OK
      let result;
      if (responseText.trim() === '') {
        console.log('Empty response - assuming success');
        result = { success: true };
      } else {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.log('Failed to parse JSON, but request was successful');
          result = { success: true, rawResponse: responseText };
        }
      }

      console.log('Token stored successfully in database:', result);
      return { token };
    } catch (error) {
      console.error('Error storing token to database:', error);
      throw new Error(`Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const storeTokensLocally = async (tokenData: TokenData): Promise<TokenData> => {
    try {
      await AsyncStorage.setItem('@trello_access_token', tokenData.token);
      if (tokenData.expires) {
        await AsyncStorage.setItem('@trello_token_expires', tokenData.expires);
      }
      console.log("Token stored locally:", tokenData.token);
      return tokenData;
    } catch (error) {
      throw new Error('Failed to store tokens locally');
    }
  };

  const handleOAuthLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Construction de l'URL d'authentification Trello
      const authParams = new URLSearchParams({
        key: TRELLO_CONFIG.apiKey,
        name: TRELLO_CONFIG.appName,
        scope: scope,
        expiration: expiration,
        response_type: 'token',
        return_url: TRELLO_CONFIG.redirectUri
      });
      
      const authUrl = `${TRELLO_CONFIG.authUrl}?${authParams.toString()}`;
      
      console.log('Auth URL:', authUrl);
      console.log('Redirect URI:', TRELLO_CONFIG.redirectUri);
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl, 
        TRELLO_CONFIG.redirectUri,
        {
          // SOLUTION 4: Options additionnelles pour Expo Go
          showInRecents: true,
        }
      );
      
      if (result.type === 'success') {
        const { url } = result;
        console.log('Success URL:', url);
        const token = extractTokenFromUrl(url);
        
        if (token) {
          // Stocker le token dans la base de données
          const tokenData = await storeTrelloTokenToDatabase(token);
          
          // Stocker également localement pour un accès rapide
          const storedTokenData = await storeTokensLocally(tokenData);

          if (onSuccess) {
            onSuccess(storedTokenData);
          } else {
            Alert.alert('Success', 'Successfully connected to Trello!');
          }
        } else {
          throw new Error('No authorization token received');
        }
      } else if (result.type === 'cancel') {
        return;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('OAuth Error:', error);
      const errorMessage: string = error.message || 'OAuth authentication failed';
      
      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleOAuthLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={loadingColor} />
          <Text style={[styles.buttonText, textStyle, { marginLeft: 8 }]}>
            Connecting...
          </Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, textStyle]}>
          Connect to Trello
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e9d5ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TrelloOAuthButton;

/* 
CONFIGURATION REQUISE:

1. API_CONFIG.baseUrl: Remplacez par l'URL de votre API
2. Token d'authentification: Assurez-vous que le token utilisateur est stocké dans SecureStore avec la clé 'userToken' (ou modifiez selon votre implémentation)
3. Format d'autorisation: Vérifiez que le format 'Bearer ${userToken}' correspond à ce que votre API attend

UTILISATION:
```tsx
import TrelloOAuthButton from './TrelloOAuthButton';

<TrelloOAuthButton
  onSuccess={(tokenData) => {
    console.log('Token Trello connecté:', tokenData.token);
    // Le token est maintenant stocké dans votre base de données
  }}
  onError={(error) => {
    console.error('Erreur:', error);
  }}
  scope="read,write"
  expiration="30days"
/>
```

FLUX MODIFIÉ:
1. L'utilisateur s'authentifie avec Trello
2. Le token est récupéré depuis l'URL de callback
3. Le token est envoyé à votre API via l'endpoint PUT /store-trello-token
4. Le token est également stocké localement pour un accès rapide
5. La validation du token est supprimée (sera faite côté serveur si nécessaire)
*/