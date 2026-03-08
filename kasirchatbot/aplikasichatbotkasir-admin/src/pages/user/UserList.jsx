import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getUsers, addUser, updateUser, deleteUser, toggleUserStatus } from "../../services/api";
import { connectSocket, disconnectSocket } from "../../services/socket";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'add', 'edit', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ nama: '', email: '', phone: '', status: 'active' });
  const [localStatus, setLocalStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    fetchUsers();
    
    // Setup WebSocket untuk real-time updates
    console.log('🔌 Setting up WebSocket...');
    const socket = connectSocket();
    
    // Test connection
    socket.on('connect', () => {
      console.log('✅ UserList: Socket connected successfully');
    });
    
    socket.on('user_added', (newUser) => {
      console.log('👤 New user added:', newUser);
      setUsers(prev => {
        // Cek duplikat
        if (prev.find(u => u.id === newUser.id)) return prev;
        return [newUser, ...prev];
      });
      showToastMessage('Pengguna baru ditambahkan!');
    });
    
    socket.on('user_updated', (updatedUser) => {
      console.log('✏️ User updated:', updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      showToastMessage('Data pengguna diupdate!');
    });
    
    socket.on('user_deleted', (deletedUserId) => {
      console.log('🗑️ User deleted:', deletedUserId);
      setUsers(prev => prev.filter(u => u.id !== deletedUserId));
      showToastMessage('Pengguna dihapus!');
    });
    
    socket.on('user_status_changed', ({ userId, status }) => {
      console.log('🔄 User status changed:', userId, status);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
      showToastMessage(`Status pengguna diubah menjadi ${status === 'active' ? 'Aktif' : 'Tidak Aktif'}!`);
    });
    
    return () => {
      console.log('🔌 Cleaning up WebSocket listeners...');
      socket.off('connect');
      socket.off('user_added');
      socket.off('user_updated');
      socket.off('user_deleted');
      socket.off('user_status_changed');
      // JANGAN disconnect socket karena masih digunakan komponen lain
    };
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const data = await getUsers();
      console.log("Response:", data);
      if (data.success) {
        setUsers(data.users);
      } else {
        console.error("Failed to fetch users:", data.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ nama: '', email: '', phone: '', status: 'active' });
    setShowModal(true);
  };

  const handleView = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({ nama: user.nama || '', email: user.email, phone: user.phone || '' });
    setLocalStatus(user.status);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleToggleStatusInModal = () => {
    const newStatus = localStatus === 'active' ? 'inactive' : 'active';
    setLocalStatus(newStatus);
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteUser(selectedUser.id);
      if (result.success) {
        fetchUsers();
        setShowDeleteModal(false);
        showToastMessage('Pengguna berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        const result = await addUser(formData);
        if (result.success) {
          fetchUsers();
          setShowModal(false);
          showToastMessage('Pengguna berhasil ditambahkan!');
        }
      } else if (modalMode === 'edit') {
        const result = await updateUser(selectedUser.id, { ...formData, status: localStatus });
        if (result.success) {
          fetchUsers();
          setShowModal(false);
          showToastMessage('Pengguna berhasil diupdate!');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const toggleUserStatusAPI = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const result = await toggleUserStatus(userId, newStatus);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ nama: '', email: '', phone: '', status: 'active' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
          </div>
          <button onClick={handleAdd} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all">
            + Tambah Pengguna
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No HP</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status Akun</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                 Tanggal Bergabung
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Belum ada pengguna terdaftar
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800">{user.id}</td>
                    <td className="px-6 py-4 text-gray-800">{user.nama || "-"}</td>
                    <td className="px-6 py-4 text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 text-gray-800">{user.telepon || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.dibuat_pada).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <button 
                            data-dropdown={user.id}
                            onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {dropdownOpen === user.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)} />
                              <div className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 w-48" 
                                style={{
                                  top: `${document.querySelector(`[data-dropdown="${user.id}"]`)?.getBoundingClientRect().bottom + 5}px`,
                                  right: `${window.innerWidth - document.querySelector(`[data-dropdown="${user.id}"]`)?.getBoundingClientRect().right}px`
                                }}
                              >
                                <button 
                                  onClick={() => {
                                    handleView(user);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Lihat Detail
                                </button>
                                <button 
                                  onClick={() => {
                                    handleEdit(user);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    handleDelete(user);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Hapus
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {modalMode === 'add' ? 'Tambah Pengguna' : modalMode === 'edit' ? 'Edit Pengguna' : 'Detail Pengguna'}
            </h2>
            
            {modalMode === 'view' ? (
              <div className="overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 w-1/3">ID</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{selectedUser?.id}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">Nama</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{selectedUser?.nama || '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">Email</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{selectedUser?.email}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">No HP</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{selectedUser?.telepon || '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">Status</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedUser?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser?.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">Tanggal Daftar</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(selectedUser?.dibuat_pada).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button onClick={closeModal} className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={modalMode === 'add' ? formData.status === 'active' : localStatus === 'active'} 
                        onChange={modalMode === 'add' ? 
                          (e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'}) : 
                          handleToggleStatusInModal
                        } 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      (modalMode === 'add' ? formData.status : localStatus) === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(modalMode === 'add' ? formData.status : localStatus) === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Simpan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold">{selectedUser?.email}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Batal
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
