// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { 
    getAuth, 
} from 'firebase/auth';
import { 
    getFirestore, 
    serverTimestamp,
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    getDocs,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- Initialization ---
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storageService = getStorage(app);

// Keep the storage object for compatibility, but add the real storage service
const storage = { appId: firebaseConfig.appId, db, serverTimestamp, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, storage: storageService };

export { app, auth, db, storage, serverTimestamp };
