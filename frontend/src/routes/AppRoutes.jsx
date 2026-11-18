import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import PortalLayout from '../layouts/PortalLayout.jsx';
import { RequireAdmin, RequireParishioner, ScreenGate } from './guards.jsx';

import HomePage from '../pages/public/HomePage.jsx';
import AboutPage from '../pages/public/AboutPage.jsx';
import SacramentsPage from '../pages/public/SacramentsPage.jsx';
import SchedulePage from '../pages/public/SchedulePage.jsx';
import EventsPage from '../pages/public/EventsPage.jsx';
import AnnouncementsPage from '../pages/public/AnnouncementsPage.jsx';
import AnnouncementDetailPage from '../pages/public/AnnouncementDetailPage.jsx';
import ContactPage from '../pages/public/ContactPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';
import DesignSystemPage from '../pages/public/DesignSystemPage.jsx';

import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';
import AdminLoginPage from '../pages/auth/AdminLoginPage.jsx';

import PortalHomePage from '../pages/parishioner/PortalHomePage.jsx';
import MyRequestsPage from '../pages/parishioner/MyRequestsPage.jsx';
import NewRequestPage from '../pages/parishioner/NewRequestPage.jsx';
import PortalAppointmentsPage from '../pages/parishioner/PortalAppointmentsPage.jsx';
import PortalMessagesPage from '../pages/parishioner/PortalMessagesPage.jsx';
import PortalCertificatesPage from '../pages/parishioner/PortalCertificatesPage.jsx';
import PortalProfilePage from '../pages/parishioner/PortalProfilePage.jsx';

import DashboardPage from '../pages/admin/DashboardPage.jsx';
import RequestsPage from '../pages/admin/RequestsPage.jsx';
import RequestDetailPage from '../pages/admin/RequestDetailPage.jsx';
import AppointmentsPage from '../pages/admin/AppointmentsPage.jsx';
import ParishionersPage from '../pages/admin/ParishionersPage.jsx';
import EventCalendarPage from '../pages/admin/EventCalendarPage.jsx';
import CertificatesPage from '../pages/admin/CertificatesPage.jsx';
import RecordsPage from '../pages/admin/RecordsPage.jsx';
import PriestsPage from '../pages/admin/PriestsPage.jsx';
import AdminMessagesPage from '../pages/admin/AdminMessagesPage.jsx';
import ReportsPage from '../pages/admin/ReportsPage.jsx';
import UserAccountsPage from '../pages/admin/UserAccountsPage.jsx';
import AdminProfilePage from '../pages/admin/AdminProfilePage.jsx';

const gate = (screen, element) => <ScreenGate screen={screen}>{element}</ScreenGate>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="sacraments" element={<SacramentsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />

      <Route path="/portal" element={<RequireParishioner><PortalLayout /></RequireParishioner>}>
        <Route index element={<PortalHomePage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="requests/new" element={<NewRequestPage />} />
        <Route path="appointments" element={<PortalAppointmentsPage />} />
        <Route path="messages" element={<PortalMessagesPage />} />
        <Route path="certificates" element={<PortalCertificatesPage />} />
        <Route path="profile" element={<PortalProfilePage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={gate('dashboard', <DashboardPage />)} />
        <Route path="requests" element={gate('requests', <RequestsPage />)} />
        <Route path="requests/:id" element={gate('requests', <RequestDetailPage />)} />
        <Route path="appointments" element={gate('appointments', <AppointmentsPage />)} />
        <Route path="parishioners" element={gate('parishioners', <ParishionersPage />)} />
        <Route path="events" element={gate('events', <EventCalendarPage />)} />
        <Route path="certificates" element={gate('certificates', <CertificatesPage />)} />
        <Route path="records" element={gate('records', <RecordsPage />)} />
        <Route path="priests" element={gate('priests', <PriestsPage />)} />
        <Route path="messages" element={gate('messages', <AdminMessagesPage />)} />
        <Route path="reports" element={gate('reports', <ReportsPage />)} />
        <Route path="users" element={gate('users', <UserAccountsPage />)} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
