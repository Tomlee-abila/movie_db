import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { TrendingPage } from './pages/TrendingPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { TVDetailPage } from './pages/TVDetailPage';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/tv/:id" element={<TVDetailPage />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;