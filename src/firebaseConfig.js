// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGMmgMZoBobYImLqSB_tEwoCQkXqTDq-0",
  authDomain: "chatboatcit.firebaseapp.com",
  databaseURL: "https://chatboatcit-default-rtdb.firebaseio.com",
  projectId: "chatboatcit",
  storageBucket: "chatboatcit.appspot.com",
  messagingSenderId: "455981714899",
  appId: "1:455981714899:web:6d4c0ef5fabd9d1931b326",
  measurementId: "G-4F3JHSZ23W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get a reference to the database service
const database = getDatabase(app);

export default firebaseConfig;
