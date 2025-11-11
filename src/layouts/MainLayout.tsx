import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="w-full h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full bg-gray-800 text-white p-4 flex">
        <h2 className="text-xl font-bold w-25">MyApp</h2>
        <nav className="flex flex-1 justify-center items-center space-x-4">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <Link to="/about" className="hover:text-blue-400">About</Link>
          <Link to="/aiChat" className="hover:text-blue-400">AiChat</Link>
        </nav>
      </aside>
      {/* Main content */}
      <main className="h-[calc(100%-70px)] p-6 bg-gray-100 overflow-y-auto scrollbar-hidden">
        <Outlet />
      </main>
    </div>
  );
}
