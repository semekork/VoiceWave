import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';  


// --- SIGN UP ---
export const register = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user profile info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      email,
      createdAt: new Date().toISOString(),
    });

    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// --- SIGN IN ---
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error: error.message };
  }
};

// --- SIGN OUT ---
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// --- GET CURRENT USER ---
export const getCurrentUser = () => {
  return auth.currentUser;
};

// --- LISTEN TO AUTH STATE ---
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback); // returns unsubscribe fn
};
