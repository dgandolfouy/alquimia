// IMPORTANT: This is a template. You must create your own Firebase project
// and replace the placeholder configuration with your actual keys.

// 1. Go to https://firebase.google.com/ and create a new project.
// 2. In your project, go to Project Settings (gear icon).
// 3. In the "General" tab, scroll down to "Your apps".
// 4. Click the web icon (</>) to create a new web app.
// 5. Give it a name (e.g., "Alquimia Financiera Web").
// 6. Firebase will give you a configuration object. Copy the values into the firebaseConfig object below.

const firebaseConfig = {
  apiKey: "AIzaSyCS1NNLSVDBCEA9PLqb5G1Dy0y6iucVlNk",
  authDomain: "alquimia-56a4a.firebaseapp.com",
  projectId: "alquimia-56a4a",
  storageBucket: "alquimia-56a4a.firebasestorage.app",
  messagingSenderId: "693483593654",
  appId: "1:693483593654:web:0e5f4fcbae54809f3fab17"
};

// Check if the config has been changed from the placeholder values
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app, auth, db, googleProvider;

if (isFirebaseConfigured) {
  try {
    // @ts-ignore
    app = firebase.initializeApp(firebaseConfig);
    // @ts-ignore
    auth = firebase.auth();
    // @ts-ignore
    db = firebase.firestore();
    // @ts-ignore
    googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // Enable persistence
    // @ts-ignore
    db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Firestore persistence failed: multiple tabs open.');
        } else if (err.code == 'unimplemented') {
            console.warn('Firestore persistence is not supported in this browser.');
        }
    });
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

export { app, auth, db, googleProvider };