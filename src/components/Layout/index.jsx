// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import ResponsiveLayout from "../ResponsiveLayout";

const Layout = () => {
  return (
    <ResponsiveLayout>
      <Outlet />
    </ResponsiveLayout>
  );
};

export default Layout;
