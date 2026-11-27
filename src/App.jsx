import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { roleHome } from "./utils/navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import AccessDenied from "./pages/public/AccessDenied";
import NotFound from "./pages/public/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminActivity from "./pages/admin/AdminActivity";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import DoctorRecords from "./pages/doctor/DoctorRecords";

import PatientDashboard from "./pages/patient/PatientDashboard";
import FindDoctor from "./pages/patient/FindDoctor";
import DoctorProfile from "./pages/patient/DoctorProfile";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientRecords from "./pages/patient/PatientRecords";

import AppointmentsPage from "./pages/shared/AppointmentsPage";
import PrescriptionsPage from "./pages/shared/PrescriptionsPage";
import ProfilePage from "./pages/shared/ProfilePage";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? roleHome(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AppointmentsPage title="Appointments" subtitle="Approve, book and manage every appointment." />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["doctor"]} />}>
        <Route path="/doctor" element={<AppLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<AppointmentsPage title="My appointments" subtitle="Appointments assigned to you." />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="patients/:patientId" element={<DoctorPatientDetail />} />
          <Route path="records" element={<DoctorRecords />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["patient"]} />}>
        <Route path="/patient" element={<AppLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="doctors" element={<FindDoctor />} />
          <Route path="doctors/:doctorId" element={<DoctorProfile />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="appointments" element={<AppointmentsPage title="My appointments" subtitle="Your upcoming and past visits." />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
