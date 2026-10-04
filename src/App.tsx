import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { LocationProvider } from '@/lib/location/LocationContext';
import { LocationSelectorModal } from '@/components/location/LocationSelectorModal';
import { AppRouter } from '@/routes/AppRouter';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <LocationProvider>
          <AppRouter />
          <LocationSelectorModal />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
