import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { auth, googleProvider } from '../services/firebase';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!auth) {
        setError('Firebase no está configurado.');
        setLoading(false);
        return;
    }

    if (isLoginView) {
      try {
        await auth.signInWithEmailAndPassword(email, pass);
      } catch (err: any) {
        setError(err.message || 'Error al ingresar.');
      }
    } else {
      if (pass !== confirmPass) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      try {
        await auth.createUserWithEmailAndPassword(email, pass);
      } catch (err: any) {
        setError(err.message || 'Error al registrar.');
      }
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      if (!auth || !googleProvider) {
        setError('Firebase no está configurado.');
        setLoading(false);
        return;
      }
      try {
          await auth.signInWithPopup(googleProvider);
      } catch (err: any) {
          console.error("Google Sign-In Error:", err);
          if (err.code !== 'auth/popup-closed-by-user') {
             setError('Error con Google. Intenta de nuevo.');
          }
      }
      setLoading(false);
  };

  const handlePasswordReset = async () => {
      if (!email) {
          setError('Ingresa tu email para reiniciar la contraseña.');
          return;
      }
      setLoading(true);
      setError('');
      setMessage('');
      try {
        await auth.sendPasswordResetEmail(email);
        setMessage('Se ha enviado un correo para reiniciar tu contraseña.');
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-900 text-gray-100 p-4 font-sans text-center">
      <div className="w-full flex-grow flex flex-col justify-center items-center px-8">
        <h1 className="font-montserrat text-4xl text-gray-100 tracking-[0.4em] animate-pulse-weight text-center leading-relaxed" style={{ fontWeight: 100 }}>
          ALQUIMIA
        </h1>
      </div>

      <div className="w-full max-w-sm space-y-4 flex-shrink-0">
        <form onSubmit={handleAuthAction} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-800/50 border border-gray-700 placeholder-gray-500 rounded-lg p-3 text-center" required />
          {isLoginView && <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Contraseña" className="w-full bg-gray-800/50 border border-gray-700 placeholder-gray-500 rounded-lg p-3 text-center" required />}
          {!isLoginView && <>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Nueva Contraseña" className="w-full bg-gray-800/50 border border-gray-700 placeholder-gray-500 rounded-lg p-3 text-center" required />
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirmar Contraseña" className="w-full bg-gray-800/50 border border-gray-700 placeholder-gray-500 rounded-lg p-3 text-center" required />
          </>}
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          {message && <p className="text-emerald-400 text-sm">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold p-3 rounded-lg">{loading ? 'Procesando...' : (isLoginView ? 'Ingresar' : 'Registrarse')}</button>
        </form>
         <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full border border-gray-700 p-3 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.213,44,30.632,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>Ingresar con Google</button>
           <button onClick={() => alert('La autenticación biométrica (WebAuthn) se puede configurar después del primer inicio de sesión.')} className="w-full border border-gray-700 p-3 rounded-lg flex items-center justify-center gap-2"><Fingerprint className="w-5 h-5 text-violet-400" />Acceso Biométrico</button>
        <div className="text-center text-sm">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setMessage('');}} className="text-violet-400 hover:underline">{isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}</button>
            {isLoginView && <span className="text-gray-600 mx-2">|</span>}
            {isLoginView && <button onClick={handlePasswordReset} className="text-violet-400 hover:underline">Olvidé mi contraseña</button>}
        </div>
      </div>
      
      <div className="w-full max-w-md text-center py-8"><p className="text-gray-500 italic text-xs">"La riqueza es la capacidad de experimentar la vida plenamente." — Henry David Thoreau</p></div>
    </div>
  );
};
export default Login;
