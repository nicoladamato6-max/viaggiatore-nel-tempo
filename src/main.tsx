import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './index.css'
import App from './App.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { AuthProvider, useAuth } from './hooks/useAuth.tsx'

// Suppress THREE.Clock deprecation warning from @react-three/fiber internals
// (r3f 9.x uses Clock internally; THREE.js r170+ marks it as deprecated)
const _origWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].startsWith('THREE.Clock')) return;
  _origWarn(...args);
};

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#060b14', color:'#00c8ff', fontFamily:'monospace', fontSize:'1rem', letterSpacing:'0.1em' }}>
      ◌ INIZIALIZZAZIONE…
    </div>
  );

  if (!user) return <Navigate to="/" replace />;

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"    element={<LandingPage />} />
          <Route path="/app" element={<ProtectedApp />} />
          <Route path="*"    element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
