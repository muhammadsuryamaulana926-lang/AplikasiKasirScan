import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";

export default function DatabaseConnections() {
  const [databases, setDatabases] = useState([]);
  const [activeDbs, setActiveDbs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [testingDb, setTestingDb] = useState(null);
  const [editingDb, setEditingDb] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, dbName: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    host: 'localhost',
    port: '3306',
    database: '',
    username: 'root',
    password: ''
  });

  useEffect(() => {
    fetchDatabases();
    fetchActiveDb();
  }, []);

  const fetchDatabases = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/databases');
      const data = await res.json();
      if (data.success) {
        setDatabases(data.databases);
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
    }
  };

  const fetchActiveDb = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/databases/active');
      const data = await res.json();
      console.log('📊 Fetched active databases:', data);
      if (data.success) {
        setActiveDbs(data.databases || []);
        console.log('✅ Active databases set to:', data.databases);
      }
    } catch (error) {
      console.error('Error fetching active db:', error);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSetActive = async (dbName) => {
    try {
      let newActiveDbs;
      
      if (activeDbs.includes(dbName)) {
        // Nonaktifkan database
        newActiveDbs = activeDbs.filter(db => db !== dbName);
      } else {
        // Aktifkan database (max 5)
        if (activeDbs.length >= 5) {
          showToastMessage('Maksimal 5 database aktif!');
          return;
        }
        newActiveDbs = [...activeDbs, dbName];
      }
      
      console.log('📤 Sending active databases:', newActiveDbs);
      
      const res = await fetch('http://localhost:3000/api/databases/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databases: newActiveDbs })
      });
      const data = await res.json();
      
      console.log('📥 Response from server:', data);
      
      if (data.success) {
        setActiveDbs(newActiveDbs);
        console.log('✅ Local state updated to:', newActiveDbs);
        showToastMessage(
          activeDbs.includes(dbName) 
            ? 'Database berhasil dinonaktifkan!' 
            : `Database berhasil diaktifkan! (${newActiveDbs.length}/5)`
        );
      } else {
        showToastMessage(data.error || 'Gagal mengubah status database');
      }
    } catch (error) {
      console.error('Error setting active db:', error);
      showToastMessage('Gagal mengubah status database');
    }
  };

  const handleTestConnection = async (dbName) => {
    setTestingDb(dbName);
    try {
      const res = await fetch('http://localhost:3000/api/databases/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database: dbName })
      });
      const data = await res.json();
      if (data.success) {
        showToastMessage(data.success ? 'Koneksi berhasil!' : 'Koneksi gagal!');
      } else {
        showToastMessage('Koneksi gagal!');
      }
    } catch (error) {
      showToastMessage('Koneksi gagal!');
    } finally {
      setTestingDb(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDb ? `http://localhost:3000/api/databases/${editingDb}` : 'http://localhost:3000/api/databases';
      const method = editingDb ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingDb(null);
        setFormData({ name: '', host: 'localhost', port: '3306', database: '', username: 'root', password: '' });
        fetchDatabases();
        showToastMessage(editingDb ? 'Koneksi database berhasil diupdate!' : 'Koneksi database berhasil ditambahkan!');
      } else {
        showToastMessage('Gagal menyimpan koneksi: ' + data.message);
      }
    } catch (error) {
      showToastMessage('Gagal menyimpan koneksi database');
    }
  };

  const handleEdit = (item) => {
    setEditingDb(item.name);
    setFormData({
      name: item.name,
      host: item.host || 'localhost',
      port: item.port || '3306',
      database: item.database || item.name,
      username: item.username || 'root',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (dbName) => {
    try {
      const res = await fetch(`http://localhost:3000/api/databases/${dbName}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchDatabases();
        if (activeDbs.includes(dbName)) {
          setActiveDbs(activeDbs.filter(db => db !== dbName));
        }
        setDeleteModal({ show: false, dbName: '' });
        showToastMessage('Koneksi database berhasil dihapus!');
      } else {
        showToastMessage('Gagal menghapus koneksi: ' + data.message);
      }
    } catch (error) {
      showToastMessage('Gagal menghapus koneksi database');
    }
  };

  const showDeleteModal = (dbName) => {
    setDeleteModal({ show: true, dbName });
    setDropdownOpen(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

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

        {/* HEADER + BUTTON */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Koneksi Database
            </h1>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
          >
            + Tambah Koneksi
          </button>
        </div>

        {/* DATABASE CONNECTIONS TABLE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Koneksi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Driver</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Host</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Database</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {databases.filter(item => item.name !== 'chatbot_db').map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50 relative">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">mysql</td>
                    <td className="px-6 py-4 text-gray-600">localhost:3306</td>
                    <td className="px-6 py-4 text-gray-600">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">root</td>
                    <td className="px-6 py-4">
                      {activeDbs.includes(item.name) ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center justify-center gap-2">
                        <div className="relative">
                          <button 
                            data-dropdown={item.name}
                            onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {dropdownOpen === item.name && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setDropdownOpen(null)}
                              />
                              <div className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 w-48" 
                                style={{
                                  top: `${document.querySelector(`[data-dropdown="${item.name}"]`)?.getBoundingClientRect().bottom + 5}px`,
                                  right: `${window.innerWidth - document.querySelector(`[data-dropdown="${item.name}"]`)?.getBoundingClientRect().right}px`
                                }}
                              >
                                <button 
                                  onClick={() => {
                                    handleSetActive(item.name);
                                    setDropdownOpen(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition hover:bg-gray-50 ${
                                    activeDbs.includes(item.name) 
                                      ? 'text-red-600' 
                                      : 'text-blue-600'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {activeDbs.includes(item.name) ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    )}
                                  </svg>
                                  {activeDbs.includes(item.name) ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                                <button 
                                  onClick={() => {
                                    handleTestConnection(item.name);
                                    setDropdownOpen(null);
                                  }}
                                  disabled={testingDb === item.name}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  {testingDb === item.name ? 'Testing...' : 'Test Koneksi'}
                                </button>
                                <button 
                                  onClick={() => {
                                    handleEdit(item);
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
                                  onClick={() => showDeleteModal(item.name)}
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
                ))}
              </tbody>
            </table>
          </div>

        {/* INFO BOX */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Penting! Sebelum Menambahkan Koneksi</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Pastikan database sudah dibuat atau di-import terlebih dahulu di MySQL/phpMyAdmin sebelum menambahkan koneksi di sini. 
                Sistem hanya menyimpan konfigurasi koneksi, bukan membuat database baru.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingDb ? 'Edit Koneksi Database' : 'Tambah Koneksi Database'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Koneksi</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData({...formData, host: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                    <input
                      type="text"
                      value={formData.port}
                      onChange={(e) => setFormData({...formData, port: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
                  <input
                    type="text"
                    value={formData.database}
                    onChange={(e) => setFormData({...formData, database: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDb(null);
                      setFormData({ name: '', host: 'localhost', port: '3306', database: '', username: 'root', password: '' });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingDb ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hapus Koneksi Database
                </h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus koneksi database <span className="font-semibold">"{deleteModal.dbName}"</span>? 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, dbName: '' })}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal.dbName)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
