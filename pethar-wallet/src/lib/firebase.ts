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

// Firebase client configuration is public, but is supplied by the deployment environment
// so project-specific identifiers and keys are not embedded in tracked source.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

// Initialize Firebase only when explicitly configured for this deployment.
export const app = hasFirebaseConfig
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Initialize Firebase Auth
export const auth = app ? getAuth(app) : null;
export const googleAuthProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore Database only when Firebase is configured.
export const db = app ? getFirestore(app) : null;

function requireFirebaseAuth() {
  if (!auth) throw new Error('Firebase is not configured for this deployment.');
  return auth;
}

function requireFirestore() {
  if (!db) throw new Error('Firebase is not configured for this deployment.');
  return db;
}

// Initialize Firebase Analytics safely in supported browser environments
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && app) {
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
  const result = await signInWithPopup(requireFirebaseAuth(), provider);
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
  return signInWithRedirect(requireFirebaseAuth(), provider);
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(requireFirebaseAuth(), email, pass);
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
  const result = await createUserWithEmailAndPassword(requireFirebaseAuth(), email, pass);
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
  return new RecaptchaVerifier(requireFirebaseAuth(), containerId, {
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
  return signInWithPhoneNumber(requireFirebaseAuth(), phoneNumber, appVerifier);
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
  return firebaseSignOut(requireFirebaseAuth());
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return auth ? onAuthStateChanged(auth, callback) : () => {};
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
  const firestore = requireFirestore();
  const userRef = doc(firestore, 'users', user.uid);
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
    const walletRef = doc(firestore, 'wallets', user.uid);
    await setDoc(walletRef, {
      uid: user.uid,
      balanceAKD: 0.00,
      balanceUSD: 0.00,
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
  const snap = await getDoc(doc(requireFirestore(), 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Get wallet data from Firestore
 */
export async function getUserWallet(uid: string): Promise<WalletData | null> {
  const snap = await getDoc(doc(requireFirestore(), 'wallets', uid));
  return snap.exists() ? (snap.data() as WalletData) : null;
}

/**
 * Record a transaction in Firestore
 */
export async function recordTransaction(data: Omit<TransactionRecord, 'createdAt'>) {
  return addDoc(collection(requireFirestore(), 'transactions'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch recent transactions for a user
 */
export async function getUserTransactions(uid: string, limitCount = 20): Promise<TransactionRecord[]> {
  const q = query(
    collection(requireFirestore(), 'transactions'),
    where('senderUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionRecord));
}

export default app;
