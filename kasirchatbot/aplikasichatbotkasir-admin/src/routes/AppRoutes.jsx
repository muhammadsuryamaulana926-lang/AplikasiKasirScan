import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/loginPage/Login";
import Dashboard from "../pages/dashboardPage/Dashboard";
import ChatHistory from "../pages/chats/ChatHistory";
import AppSettings from "../pages/settings/AppSettings";
import ApiKeys from "../pages/settings/ApiKeys";
import UserList from "../pages/user/UserList";

export default function AppRoutes() {
  console.log('AppRoutes rendered');
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/chats" element={<ChatHistory />} />
        <Route path="/settings" element={<AppSettings />} />
        <Route path="/api-keys" element={<ApiKeys />} />
      </Route>
    </Routes>
  );
}
