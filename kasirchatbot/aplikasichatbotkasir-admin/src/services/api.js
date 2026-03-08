import { API_CONFIG } from '../config/api-config';

const API_URL = API_CONFIG.BACKEND_URL;

export async function loginApi(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Login gagal");
  }

  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`);
  return res.json();
}

export async function addUser(data) {
  const res = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function toggleUserStatus(id, status) {
  const res = await fetch(`${API_URL}/api/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// Chat History APIs
export async function getChatHistory() {
  const res = await fetch(`${API_URL}/api/chat-history`);
  return res.json();
}

export async function getChatMessages(chatHistoryId) {
  const res = await fetch(`${API_URL}/api/chat-history/${chatHistoryId}/messages`);
  return res.json();
}

export async function deleteChatHistory(id) {
  const res = await fetch(`${API_URL}/api/chat-history/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
