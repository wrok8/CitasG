// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAOZfvTJpREUyymdz-zuuFWvTy1xcIszCQ",
  authDomain: "citasg-21c01.firebaseapp.com",
  databaseURL: "https://citasg-21c01-default-rtdb.firebaseio.com/",
  projectId: "citasg-21c01",
  storageBucket: "citasg-21c01.firebasestorage.app",
  messagingSenderId: "337223182241",
  appId: "1:337223182241:web:6aacfd81073bd797ef4de0"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);