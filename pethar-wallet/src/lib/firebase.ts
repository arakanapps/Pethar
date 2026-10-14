// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  type User,
  type ConfirmationResult
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAy-e6MbSsYNNxvNxjJweepuTszhX4odyU",
  authDomain: "pe-thar.firebaseapp.com",
  projectId: "pe-thar",
  storageBucket: "pe-thar.firebasestorage.app",
  messagingSenderId: "895411020406",
  appId: "1:895411020406:web:0cb9516ba0356b70fb3557",
  measurementId: "G-0L8V1028JD"
};

// Initialize Firebase (singleton pattern prevents duplicate app initialization)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Analytics safely in supported browser environments
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.debug('Firebase Analytics is not supported in this environment:', err);
  });
}

// ── Authentication Methods ──

/**
 * Sign in with Google using Firebase Auth popup
 */
export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  if (result.user) {
    createOrUpdateUserProfile(result.user).catch((err) => {
      console.warn('Firestore profile sync notice (non-fatal):', err);
    });
  }
  return result;
}

/**
 * Sign in with Google using Firebase Auth redirect
 */
export async function signInWithGoogleRedirect() {
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(auth, provider);
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    createOrUpdateUserProfile(result.user).catch((err) => {
      console.warn('Firestore profile sync notice (non-fatal):', err);
    });
  }
  return result;
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    if (displayName) {
      updateProfile(result.user, { displayName }).catch(() => {});
    }
    createOrUpdateUserProfile(result.user, { displayName }).catch((err) => {
      console.warn('Firestore profile sync notice (non-fatal):', err);
    });
  }
  return result;
}

/**
 * Configure invisible or normal reCAPTCHA for Phone Authentication
 */
export function setupRecaptchaVerifier(containerId: string, invisible = true): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: invisible ? 'invisible' : 'normal',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      console.warn('Recaptcha expired, please solve again.');
    }
  });
}

/**
 * Send SMS verification code to a phone number
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Confirm phone verification code
 */
export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  verificationCode: string
) {
  const result = await confirmationResult.confirm(verificationCode);
  if (result.user) {
    await createOrUpdateUserProfile(result.user);
  }
  return result;
}

/**
 * Sign out from Firebase Auth
 */
export async function signOutFirebase() {
  return firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ── Cloud Firestore Helpers ──

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency: string;
  language: string;
  createdAt: any;
  updatedAt: any;
}

export interface WalletData {
  uid: string;
  balanceAKD: number;
  balanceUSD: number;
  balanceMMK: number;
  walletAddress: string;
  tier: string;
  status: 'active' | 'suspended';
  updatedAt: any;
}

export interface TransactionRecord {
  id?: string;
  senderUid: string;
  recipientUid: string;
  amount: number;
  currency: string;
  type: 'transfer' | 'topup' | 'exchange' | 'payout';
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  createdAt: any;
}

/**
 * Create or sync user profile & initial wallet in Firestore
 */
export async function createOrUpdateUserProfile(
  user: User,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const baseProfile = {
    uid: user.uid,
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    displayName: user.displayName || additionalData?.displayName || null,
    photoURL: user.photoURL || null,
    currency: 'AKD',
    language: 'ak',
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // New User: create profile + default wallet
    const newProfile = {
      ...baseProfile,
      createdAt: serverTimestamp(),
      ...additionalData,
    };
    await setDoc(userRef, newProfile);

    // Initialize wallet
    const walletRef = doc(db, 'wallets', user.uid);
    await setDoc(walletRef, {
      uid: user.uid,
      balanceAKD: 1000.0, // Starter demo balance for new accounts
      balanceUSD: 1000.0,
      balanceMMK: 3500000.0,
      walletAddress: `0xAKD${user.uid.slice(0, 10).toUpperCase()}`,
      tier: 'standard',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newProfile as UserProfile;
  } else {
    // Existing user: update latest fields
    await updateDoc(userRef, {
      ...baseProfile,
      ...additionalData,
    });
    return { ...userSnap.data(), ...baseProfile } as UserProfile;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Get wallet data from Firestore
 */
export async function getUserWallet(uid: string): Promise<WalletData | null> {
  const snap = await getDoc(doc(db, 'wallets', uid));
  return snap.exists() ? (snap.data() as WalletData) : null;
}

/**
 * Record a transaction in Firestore
 */
export async function recordTransaction(data: Omit<TransactionRecord, 'createdAt'>) {
  return addDoc(collection(db, 'transactions'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch recent transactions for a user
 */
export async function getUserTransactions(uid: string, limitCount = 20): Promise<TransactionRecord[]> {
  const q = query(
    collection(db, 'transactions'),
    where('senderUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionRecord));
}

export default app;
