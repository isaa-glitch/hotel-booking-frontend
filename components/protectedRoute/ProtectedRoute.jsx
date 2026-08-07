import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  // 1. Get the user data/token saved during Login
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // e.g., "superadmin", "admin", "employee", "user"

  // 2. If no token, they are not logged in -> Send to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If their role isn't in the allowed list -> Send to an error or default page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    alert("You do not have permission to access this dashboard!");
    return <Navigate to="/login" replace />;
  }

  // 4. If they pass both checks, render the protected component!
  return children;
}

export default ProtectedRoute;
