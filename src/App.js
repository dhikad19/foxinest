import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Completed from "./pages/Completed";

const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1080);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Update mobile mode on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1080;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // close sidebar on desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Toggle button (only on mobile) */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: 20,
              left: 20,
              zIndex: 1100,
              background: "#ffbf8f",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ☰
          </button>
        )}

        {/* Page content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/completed" element={<Completed />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
