import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@project/components/ui/sonner';
import { MeProvider } from './lib/me';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Landing from './pages/Landing';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Freelancers from './pages/Freelancers';
import FreelancerProfile from './pages/FreelancerProfile';
import Messages from './pages/Messages';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {
  return (
    <MeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<RequireAuth><JobDetail /></RequireAuth>} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/freelancers/:id" element={<FreelancerProfile />} />
            <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
            <Route path="/messages/:jobId" element={<RequireAuth><Messages /></RequireAuth>} />
            <Route path="/earnings" element={<RequireAuth><Earnings /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </MeProvider>
  );
}
