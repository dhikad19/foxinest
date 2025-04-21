import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";

const Sidebar = ({ isMobile, isOpen, onClose }) => {
  const sidebarRef = useRef();

  // Click outside to close mobile sidebar
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  const sidebarStyles = {
    backgroundColor: "#fff6ee",
    height: "100vh",
    zIndex: 1000,
    transition: "left 0.3s ease-in-out",
    ...(isMobile
      ? {
          position: "fixed",
          width: "50vw",
          top: 0,
          left: isOpen ? 0 : "-370px",
        }
      : {
          position: "sticky",
          width: "330px",
          top: 0,
          left: 0,
        }),
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      <div ref={sidebarRef} className="sidebar-container" style={sidebarStyles}>
        <nav className="sidebar-nav" style={{ padding: "20px" }}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            Home
          </NavLink>
          <NavLink
            to="/completed"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            Comleted
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={onClose}
          >
            About
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
