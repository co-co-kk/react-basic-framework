import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-96 bg-white shadow-md rounded-lg p-6">
        <Outlet />
      </div>
    </div>
  );
}
