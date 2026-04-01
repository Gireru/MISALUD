import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import StaffGuard from './components/StaffGuard';

// Staff (protected) pages
import StaffDashboard from './pages/StaffDashboard';
import PatientList from './pages/PatientList';

// Public pages
import RegisterPatient from './pages/RegisterPatient';
import PatientView from './pages/PatientView';
import MisTrayectos from './pages/MisTrayectos';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* ── Public patient routes ── */}
            <Route path="/patient/view" element={<PatientView />} />
            <Route path="/mis-trayectos" element={<MisTrayectos />} />
            <Route path="/register" element={<RegisterPatient />} />

            {/* ── Hidden admin login ── */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* ── Protected staff routes ── */}
            <Route element={<StaffGuard />}>
              <Route path="/" element={<StaffDashboard />} />
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/patients" element={<PatientList />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;