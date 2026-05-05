import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyALcu6SKy9JKouXES6bx5f9DbBW-NFjAFA',
    authDomain: 'learnify-b54b0.firebaseapp.com',
    projectId: 'learnify-b54b0',
    storageBucket: 'learnify-b54b0.firebasestorage.app',
    messagingSenderId: '975368535145',
    appId: '1:975368535145:web:cb66460cceb2bac4a5b6f8',
    measurementId: 'G-SNCRJGHY5P',
};

const app = initializeApp(firebaseConfig);

// Use inMemoryPersistence — the AuthProvider handles session
// persistence manually via AsyncStorage (see AuthProvider.tsx)
export const firebaseAuth = initializeAuth(app, {
    persistence: inMemoryPersistence,
});

export default app;
