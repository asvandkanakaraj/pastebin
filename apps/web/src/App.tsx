import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider.js';
import { AuthProvider } from './components/auth-provider.js';
import { MainLayout } from './components/layout/MainLayout.js';

// React lazy loaded page components
const CreatePaste = lazy(() =>
  import('./pages/CreatePaste.js').then((m) => ({ default: m.CreatePaste }))
);
const ViewPaste = lazy(() =>
  import('./pages/ViewPaste.js').then((m) => ({ default: m.ViewPaste }))
);
const BrowsePastes = lazy(() =>
  import('./pages/BrowsePastes.js').then((m) => ({ default: m.BrowsePastes }))
);
const Login = lazy(() => import('./pages/Login.js').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register.js').then((m) => ({ default: m.Register })));
const SearchResults = lazy(() =>
  import('./pages/SearchResults.js').then((m) => ({ default: m.SearchResults }))
);
const UserProfile = lazy(() =>
  import('./pages/UserProfile.js').then((m) => ({ default: m.UserProfile }))
);

// Professional skeleton loading spinner page loader
function PageLoader() {
  return (
    <div
      className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4"
      role="status"
      aria-label="Loading page content"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg" />
      <span className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse">
        Loading secure snippet workspace...
      </span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<CreatePaste />} />
                <Route path="/v/:id" element={<ViewPaste />} />
                <Route path="/browse" element={<BrowsePastes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile/:username" element={<UserProfile />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
