import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

const AUTH_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const storage = {
  // Secure Store (for token)
  async saveToken(token: string) {
    await SecureStore.setItemAsync(AUTH_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_KEY);
  },

  async removeToken() {
    await SecureStore.deleteItemAsync(AUTH_KEY);
  },

  // AsyncStorage (for user data & bookmarks)
  async saveUser(user: User) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async removeUser() {
    await AsyncStorage.removeItem(USER_KEY);
  },
};