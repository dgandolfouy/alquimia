<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alquimia Financiera</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Montserrat', 'sans-serif'],
            },
            animation: {
              'pulse-weight': 'pulse-weight 4s ease-in-out infinite',
            },
            keyframes: {
              'pulse-weight': {
                '0%, 100%': { fontWeight: 400 },
                '50%': { fontWeight: 600 },
              }
            }
          }
        }
      }
    </script>
    <style>
      body {
        font-family: 'Montserrat', sans-serif;
      }
    </style>
</head>
  <body class="bg-gray-100 text-gray-800">
    <div id="root"></div>
    <!-- Firebase SDKs (Legacy CDN approach for simplicity in migration) -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    
    <script type="module" src="/App.tsx"></script>
  </body>
</html>