import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import MockInterview from "./pages/MockInterview.jsx";
import TechnicalQuiz from "./pages/TechnicalQuiz.jsx";
import AptitudeTest from "./pages/AptitudeTest.jsx";
import HRInterview from "./pages/HRInterview.jsx";
import ProgressTracker from "./pages/ProgressTracker.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CompanyInterviews from "./pages/CompanyInterviews.jsx";
import VideoInterview from "./pages/VideoInterview.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/technical-quiz" element={<TechnicalQuiz />} />
          <Route path="/aptitude-test" element={<AptitudeTest />} />
          <Route path="/hr-interview" element={<HRInterview />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/company-interviews" element={<CompanyInterviews />} />
          <Route path="/video-interview" element={<VideoInterview />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
