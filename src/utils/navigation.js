import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Pill,
  Search,
  Stethoscope,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

export const roleHome = (role) => ({ admin: "/admin", doctor: "/doctor", patient: "/patient" })[role] || "/login";

export const navigation = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { to: "/admin/patients", label: "Patients", icon: Users },
    { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/users", label: "User accounts", icon: UserCog },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/activity", label: "Activity log", icon: Activity },
    { to: "/admin/profile", label: "Profile", icon: UserRound },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/doctor/appointments", label: "My appointments", icon: CalendarCheck },
    { to: "/doctor/patients", label: "Patient records", icon: Users },
    { to: "/doctor/records", label: "Medical records", icon: ClipboardList },
    { to: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/doctor/profile", label: "Profile", icon: UserRound },
  ],
  patient: [
    { to: "/patient", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/patient/doctors", label: "Find a doctor", icon: Search },
    { to: "/patient/book", label: "Book appointment", icon: CalendarPlus },
    { to: "/patient/appointments", label: "My appointments", icon: CalendarCheck },
    { to: "/patient/records", label: "Medical records", icon: FileText },
    { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/patient/profile", label: "My profile", icon: UserRound },
  ],
};
