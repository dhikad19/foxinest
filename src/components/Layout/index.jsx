// src/components/Layout.jsx
import ResponsiveLayout from "../ResponsiveLayout";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <ResponsiveLayout>
      <Outlet /> {/* This renders the matched route's page */}
    </ResponsiveLayout>
  );
};

export default Layout;
