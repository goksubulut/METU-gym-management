import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import UserLayout from "./layouts/UserLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ReceptionLayout from "./layouts/ReceptionLayout.jsx";

// User pages
import Splash from "./pages/user/Splash.jsx";
import QRInfo from "./pages/user/QRInfo.jsx";
import Auth from "./pages/user/Auth.jsx";
import Dashboard from "./pages/user/Dashboard.jsx";
import Book from "./pages/user/Book.jsx";
import MuscleGroups from "./pages/user/MuscleGroups.jsx";
import Machines from "./pages/user/Machines.jsx";
import MachineDetail from "./pages/user/MachineDetail.jsx";
import Alternatives from "./pages/user/Alternatives.jsx";
import Warmup from "./pages/user/Warmup.jsx";
import Feedback from "./pages/user/Feedback.jsx";
import Appointments from "./pages/user/Appointments.jsx";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Preferences from "./pages/admin/Preferences.jsx";
import Quality from "./pages/admin/Quality.jsx";
import Matrix from "./pages/admin/Matrix.jsx";
import Faults from "./pages/admin/Faults.jsx";
import FeedbackAdmin from "./pages/admin/FeedbackAdmin.jsx";
import Inventory from "./pages/admin/Inventory.jsx";

// Reception pages
import ReceptionLogin from "./pages/reception/ReceptionLogin.jsx";
import CheckIn from "./pages/reception/CheckIn.jsx";
import AppointmentDetail from "./pages/reception/AppointmentDetail.jsx";

export default function App() {
  return (
    <Routes>
      {/* A. Kullanıcı uygulaması (mobil-first) */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Splash />} />
        <Route path="/qr-info" element={<QRInfo />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/book" element={<Book />} />
        <Route path="/muscle-groups" element={<MuscleGroups />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/machines/:id" element={<MachineDetail />} />
        {/* Makine QR kodu bu deep-link'i taşır: /machine/{machine_id}.
            Telefon kamerasıyla okununca doğrudan bu sayfayı açar. */}
        <Route path="/machine/:id" element={<MachineDetail />} />
        <Route path="/alternatives/:id" element={<Alternatives />} />
        <Route path="/warmup/:group" element={<Warmup />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/appointments" element={<Appointments />} />
      </Route>

      {/* B. Yönetici paneli (masaüstü) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="preferences" element={<Preferences />} />
        <Route path="quality" element={<Quality />} />
        <Route path="matrix" element={<Matrix />} />
        <Route path="faults" element={<Faults />} />
        <Route path="feedback" element={<FeedbackAdmin />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>

      {/* C. Resepsiyon / Check-in paneli (masaüstü/tablet) */}
      <Route path="/reception/login" element={<ReceptionLogin />} />
      <Route path="/reception" element={<ReceptionLayout />}>
        <Route index element={<CheckIn />} />
        <Route path="appointment/:id" element={<AppointmentDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
