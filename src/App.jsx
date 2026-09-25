import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import BlogDetails from "./pages/BlogDetails";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
          {/* Main Navigation */}
          <Navbar />

          {/* Page Routing */}
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blog/:id" element={<BlogDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create"
                element={
                  <ProtectedRoute>
                    <CreateBlog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditBlog />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Gutenverse Magazine Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
