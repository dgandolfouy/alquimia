import React from 'react';
import { AlertTriangle, Code } from 'lucide-react';

const FirebaseNotConfigured: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg border border-yellow-500/30 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Configuración Requerida</h1>
        <p className="text-gray-400 mb-6">
          Para que la Alquimia comience, necesitas conectar tu propia bóveda de datos segura en Firebase.
        </p>

        <div className="text-left space-y-4 text-sm">
          <p>
            <strong className="text-yellow-400">Paso 1:</strong> Ve a{' '}
            <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
              Firebase
            </a> y crea un nuevo proyecto gratuito.
          </p>
          <p>
            {/* FIX: Escaped HTML special characters to prevent JSX parsing errors. */}
            <strong className="text-yellow-400">Paso 2:</strong> Dentro de tu proyecto, ve a <span className="font-mono bg-gray-700 px-1 rounded">Project Settings &gt; General</span> y crea una nueva aplicación web (ícono <code className="font-mono bg-gray-700 px-1 rounded text-violet-300">&lt;/&gt;</code>).
          </p>
          <p>
            <strong className="text-yellow-400">Paso 3:</strong> Firebase te dará un objeto `firebaseConfig`. Copia esas claves.
          </p>
          <p>
            <strong className="text-yellow-400">Paso 4:</strong> Abre el archivo <code className="font-mono bg-gray-700 px-1 rounded text-violet-300">services/firebase.ts</code> en tu editor de código y pega tus claves donde se indica.
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-900 rounded-lg text-left">
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-2"><Code size={14}/> <span>En: services/firebase.ts</span></p>
            <pre className="text-xs text-gray-400 overflow-x-auto">
{`const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUÍ",
  authDomain: "TU_AUTH_DOMAIN_AQUÍ",
  projectId: "TU_PROJECT_ID_AQUÍ",
  // ...y el resto de tus claves
};`}
            </pre>
        </div>
        <p className="text-xs text-gray-500 mt-4">Una vez que guardes los cambios, la aplicación se recargará y estará lista para usar.</p>
      </div>
    </div>
  );
};

export default FirebaseNotConfigured;
