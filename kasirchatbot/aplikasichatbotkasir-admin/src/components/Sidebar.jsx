import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../layouts/AdminLayout";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpires");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon:
        "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      label: "Manajemen Pengguna",
      path: "/users",
      icon:
        "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      label: "Riwayat Chat",
      path: "/chats",
      icon:
        "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    {
      label: "Pengaturan Database",
      path: "/settings",
      icon:
        "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    },
    {
      label: "API Keys",
      path: "/api-keys",
      icon:
        "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    },
  ];

  return (
    <div
      className={`h-screen fixed top-0 left-0 flex flex-col bg-white shadow-2xl
      transition-all duration-300
      ${sidebarOpen ? "w-72" : "w-20"}`}
    >
      {/* HEADER */}
      <div className="pt-4 px-4 pb-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img
            src="/logo_mm-removebg-preview.png"
            alt="Logo"
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          {sidebarOpen && (
            <div>
              <h2 className="text-lg font-bold leading-tight">
                Panel Admin
              </h2>
              <p className="text-xs text-gray-600">
                Manajemen Chatbot
              </p>
            </div>
          )}
        </div>

        {/* TOGGLE */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-gray-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
            />
          </svg>
        </button>
      </div>

      {/* MENU */}
      <nav className="p-3 space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
            ${
              location.pathname === item.path
                ? "bg-gray-300 text-gray-800"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={item.icon}
              />
            </svg>

            {/* TEXT */}
            <span
              className={`whitespace-nowrap transition-all duration-200
              ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="p-3 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>

          {sidebarOpen && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
