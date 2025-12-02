// Configuración de Firebase para Alquimia Financiera
// Las claves han sido provistas por el usuario.

const firebaseConfig = {
  apiKey: "AIzaSyCS1NNLSVDBCEA9PLqb5G1Dy0y6iucVlNk",
  authDomain: "alquimia-56a4a.firebaseapp.com",
  projectId: "alquimia-56a4a",
  storageBucket: "alquimia-56a4a.firebasestorage.app",
  messagingSenderId: "693483593654",
  appId: "1:693483593654:web:0e5f4fcbae54809f3fab17"
};

// Check if the config has been changed from the placeholder values
// With the real keys inserted above, this will evaluate to true.
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
