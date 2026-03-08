import Sidebar from "../components/Sidebar";
import { useState, createContext, useContext } from "react";

// Context untuk sidebar state
const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Simpan state ke localStorage setiap kali berubah
  const handleSidebarToggle = (newState) => {
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen: handleSidebarToggle }}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Sidebar />
        <main 
          className={`flex-1 p-8 transition-all duration-300 ${
            sidebarOpen ? "ml-72" : "ml-20"
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
