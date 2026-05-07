import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import AuthLayout from "./layouts/AuthLayout";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingOverlay from "./components/LoadingOverlay";
import useAppContext from "./hooks/useAppContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import CustomerDashboard from "./pages/CustomerDashboard";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import WishlistPage from "./pages/WishlistPage";
import MoodSearchPage from "./pages/MoodSearchPage";
import TravelChatbot from "./components/TravelChatbot";
import BudgetPlanner from "./components/BudgetPlanner";

const AddHotel = lazy(() => import("./pages/AddHotel"));
const MyHotels = lazy(() => import("./pages/MyHotels"));
const EditHotel = lazy(() => import("./pages/EditHotel"));
const Booking = lazy(() => import("./pages/Booking"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const ApiStatus = lazy(() => import("./pages/ApiStatus"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingOverlay message="Loading page..." />}>
    {children}
  </Suspense>
);

const App = () => {
  const { isLoggedIn } = useAppContext();
  const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") : null;

  const ProtectedOwnerRoute = ({ children }: { children: React.ReactNode }) => {
    if (userRole === "hotel_owner" || userRole === "admin") {
      return <>{children}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/search" element={<Layout><Search /></Layout>} />
          <Route path="/detail/:hotelId" element={<Layout><Detail /></Layout>} />
          <Route path="/api-docs" element={<Layout><PageSuspense><ApiDocs /></PageSuspense></Layout>} />
          <Route path="/api-status" element={<Layout><PageSuspense><ApiStatus /></PageSuspense></Layout>} />
          <Route path="/business-insights" element={<Layout><ProtectedOwnerRoute><PageSuspense><AnalyticsDashboard /></PageSuspense></ProtectedOwnerRoute></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/sign-in" element={<AuthLayout><SignIn /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
          <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
          <Route path="/verify-email" element={<AuthLayout><VerifyEmail /></AuthLayout>} />
          <Route path="/auth/callback" element={<Layout><AuthCallback /></Layout>} />
          <Route path="/my-hotels" element={<Layout><ProtectedOwnerRoute><PageSuspense><MyHotels /></PageSuspense></ProtectedOwnerRoute></Layout>} />
          <Route path="/my-bookings" element={<Layout><MyBookings /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/owner-dashboard" element={<Layout><ProtectedOwnerRoute><PageSuspense><OwnerDashboard /></PageSuspense></ProtectedOwnerRoute></Layout>} />
          <Route path="/customer-dashboard" element={<Layout><CustomerDashboard /></Layout>} />
          {isLoggedIn && (
            <>
              <Route path="/hotel/:hotelId/booking" element={<Layout><PageSuspense><Booking /></PageSuspense></Layout>} />
              <Route path="/add-hotel" element={<Layout><ProtectedOwnerRoute><PageSuspense><AddHotel /></PageSuspense></ProtectedOwnerRoute></Layout>} />
              <Route path="/edit-hotel/:hotelId" element={<Layout><ProtectedOwnerRoute><PageSuspense><EditHotel /></PageSuspense></ProtectedOwnerRoute></Layout>} />
            </>
          )}
          <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
          <Route path="/mood-search" element={<Layout><MoodSearchPage /></Layout>} />
          <Route path="/budget-planner" element={<Layout><BudgetPlanner /></Layout>} />
          <Route path="/admin-dashboard" element={
            <Layout>
              {userRole === "admin" ? (
                <PageSuspense><AdminDashboard /></PageSuspense>
              ) : (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-muted-foreground mt-2">Admin access required.</p>
                  </div>
                </div>
              )}
            </Layout>
          } />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
        <Toaster />
        <TravelChatbot />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
