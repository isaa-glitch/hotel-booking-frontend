import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import ResetPassword from "../components/ResetPassword";
import ForgotPassword from "../components/ForgotPassword";

// 1. Import your ProtectedRoute and Dashboards
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import SuperAdminDashboard from "../components/superAdmin/SuperAdminDashboard";
import HotelAdminForm from "../components/HotelAdminForm";

import AdminDashboard from '../components/hotelAdmin/HotelAdminDashboard'
import UserDashboard from "../components/user/UserDashboard";
// For later: import EmployeeDashboard from '../components/EmployeeDashboard'
// For later: import UserDashboard from '../components/UserDashboard'

import axios from "axios";

// If using Vite:
// axios.defaults.baseURL =
//   import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/hotelAdminForm" element={<HotelAdminForm />} />
          <Route path="/user" element={<UserDashboard/>} />

          {/* =========================================================
              PROTECTED DASHBOARD ROUTES (Role-Based Access Control)
             ========================================================= */}

          {/* SuperAdmin Route - Only accessible if role === "superadmin" */}
          <Route
            path="/superadmin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hoteladmin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["hoteladmin", "superadmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Future Routes (Ready for when you build them!) */}
          {/* 
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            } 
          /> 
          */}

          {/* Catch-all: If someone types a random URL, send to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
