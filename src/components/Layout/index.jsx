// src/components/Layout.jsx
import ResponsiveLayout from "../ResponsiveLayout";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <ResponsiveLayout>
      <Outlet />
    </ResponsiveLayout>
  );
};

export default Layout;
