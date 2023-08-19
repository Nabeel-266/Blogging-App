// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";

// Import Authentication of Firebase
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";

// Import Firestore Database of Firebase
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    where,
    query,
    deleteField,
    orderBy,
    serverTimestamp,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

// Import Storage of Firebase
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";


// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTqdc1406RWvdCmjk6_7D0xFXkFGGlUlU",
    authDomain: "hackathon-b982f.firebaseapp.com",
    projectId: "hackathon-b982f",
    storageBucket: "hackathon-b982f.appspot.com",
    messagingSenderId: "636728817570",
    appId: "1:636728817570:web:bb6ba014effae84e0364fb"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firebase Firestore Database and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
const storage = getStorage(app);


// For Export Files
export {
    app,
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    doc,
    addDoc,
    setDoc,
    collection,
    getDocs,
    getDoc,
    query,
    storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    updateDoc,
    deleteField,
    orderBy,
    serverTimestamp,
    deleteDoc
};