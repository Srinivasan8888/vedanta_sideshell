import "./App.css";
import { BrowserRouter, Routes, Route, HashRouter, Navigate } from "react-router-dom";
// import ThreeScene from "./Assets/components/Model/ThreeScene";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Analytics from "./pages/Analytics/Analytics";
import NoPage from "./pages/Nopage/Nopage";
import Report from "./pages/Report/Report";
import Settings from "./pages/Settings/Settings";
import ProtectedRoute from "./Assets/components/ProtectedRouter/ProtectedRouter";
import ProtectedAdminRoute from "./Assets/components/ProtectedRouter/ProtectedAdminRouter";
import Heatmap from "./pages/Heatmap/Heatmap";
import Test from "./pages/Test";
import CollectorBar from "./pages/CollectorBar/CollectorBar";
import MainLayout from "./layouts/MainLayout";
import AdminSidebar from "./Assets/components/sidebar-admins/adminsidebar";
import Generatereport from "./Assets/components/sidebar-admins/components/Generatereport";
import Alert from "./Assets/components/sidebar-admins/components/Alert";
import ColorRange from "./Assets/components/sidebar-admins/components/ColorRange";
import User from "./Assets/components/sidebar-admins/components/User";
import Alertslogs from "./Assets/components/sidebar-admins/components/Alertslogs";
import Values from "./Assets/components/sidebar-admins/components/Values";
import bg from './Assets/images/bg.png'
// import helmet from "helmet";
// App.use(helmet());
function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/admin_xyma_signup" element={<Signup />} />
          
          {/* Protected routes */}
          
            <Route path="/admin/*" element={
            <div className="flex min-h-screen bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url(${bg})` }}>
              <AdminSidebar />
              <div className="flex-1">
                <ProtectedAdminRoute>
                  <Routes>
                    <Route index element={<Navigate to="generate-report" replace />} />
                    <Route path="generate-report" element={<Generatereport />} />
                    <Route path="set-alert" element={<Alert />} />
                    <Route path="color-range" element={<ColorRange />} />
                    <Route path="values" element={<Values />} />
                    <Route path="user" element={<User />} />
                    <Route path="alerts-logs" element={<Alertslogs />} />
                    <Route path="*" element={<Navigate to="Settings" replace />} />
                  </Routes>
                </ProtectedAdminRoute>
              </div>
            </div>
          } />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/CollectorBar" element={<CollectorBar />} />
                <Route path="/Analytics" element={<Analytics />} />
                <Route path="/Report" element={<Report />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Heatmap" element={<Heatmap />} />
                <Route path="/Test" element={<Test />} />
              </Route>
            </Route>

          {/* 404 route - should be last */}
          <Route path="*" element={<NoPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
