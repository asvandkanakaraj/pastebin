import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider.js';
import { AuthProvider } from './components/auth-provider.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { CreatePaste } from './pages/CreatePaste.js';
import { ViewPaste } from './pages/ViewPaste.js';
import { BrowsePastes } from './pages/BrowsePastes.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<CreatePaste />} />
              <Route path="/v/:id" element={<ViewPaste />} />
              <Route path="/browse" element={<BrowsePastes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
