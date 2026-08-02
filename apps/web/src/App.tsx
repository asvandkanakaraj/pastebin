import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider.js';
import { AuthProvider } from './components/auth-provider.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { Logo } from './components/layout/Logo.js';

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
const About = lazy(() =>
  import('./pages/About.js').then((m) => ({ default: m.About }))
);
const NotFound = lazy(() =>
  import('./pages/NotFound.js').then((m) => ({ default: m.NotFound }))
);

// Professional skeleton loading spinner page loader
function PageLoader() {
  return (
    <div
      className="flex h-[60vh] w-full flex-col items-center justify-center space-y-5 animate-pulse"
      role="status"
      aria-label="Loading page content"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 shadow-lg">
        <Logo size={32} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Initializing workspace...
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
                <Route path="/about" element={<About />} />
                <Route path="/browse" element={<BrowsePastes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile/:username" element={<UserProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
