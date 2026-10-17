import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './index.css'
import App from './App.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { AuthProvider, useAuth } from './hooks/useAuth.tsx'

function ProtectedApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#060b14', color:'#00c8ff', fontFamily:'monospace', fontSize:'1rem', letterSpacing:'0.1em' }}>
      ◌ INIZIALIZZAZIONE…
    </div>
  );

  if (!user) {
    // Redirect a landing con ?login=true per aprire il modal
    navigate('/?login=true', { replace: true });
    return null;
  }

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
