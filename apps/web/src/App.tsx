import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { CreatePaste } from './pages/CreatePaste.js';
import { ViewPaste } from './pages/ViewPaste.js';
import { BrowsePastes } from './pages/BrowsePastes.js';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<CreatePaste />} />
            <Route path="/v/:id" element={<ViewPaste />} />
            <Route path="/browse" element={<BrowsePastes />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
