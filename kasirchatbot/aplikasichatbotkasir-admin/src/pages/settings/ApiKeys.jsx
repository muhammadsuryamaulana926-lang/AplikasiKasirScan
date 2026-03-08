import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { API_CONFIG } from '../../config/api-config';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, apiName: '' });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', url: '', models: [''] });
  const [formData, setFormData] = useState({
    name: '',
    provider: 'groq',
    apiKey: '',
    model: '',
    url: '',
    enabled: true
  });

  const API_URL = API_CONFIG.BACKEND_URL;

  const apiProviders = {
    groq: { 
      name: 'Groq', 
      url: 'https://api.groq.com/openai/v1/chat/completions',
      models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
    },
    gemini: { 
      name: 'Google Gemini', 
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp']
    },
    mistral: { 
      name: 'Mistral AI', 
      url: 'https://api.mistral.ai/v1/chat/completions',
      models: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest']
    },
    cohere: { 
      name: 'Cohere', 
      url: 'https://api.cohere.ai/v1/chat',
      models: ['command', 'command-light', 'command-r', 'command-r-plus']
    },
    huggingface: { 
      name: 'HuggingFace', 
      url: 'https://api-inference.huggingface.co/models/',
      models: ['meta-llama/Meta-Llama-3-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.2']
    },
    openrouter: { 
      name: 'OpenRouter', 
      url: 'https://openrouter.ai/api/v1/chat/completions',
      models: ['google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.1-8b-instruct:free']
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch(`${API_URL}/api/api-keys`);
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.apiKeys);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingApi 
        ? `${API_URL}/api/api-keys/${editingApi}` 
        : `${API_URL}/api/api-keys`;
      const method = editingApi ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingApi(null);
        setFormData({ name: '', provider: 'groq', apiKey: '', model: '', url: '', enabled: true });
        fetchApiKeys();
        showToastMessage(editingApi ? 'API Key berhasil diupdate!' : 'API Key berhasil ditambahkan!');
      } else {
        showToastMessage('Gagal menyimpan API Key: ' + data.message);
      }
    } catch (error) {
      showToastMessage('Gagal menyimpan API Key');
    }
  };

  const handleEdit = (item) => {
    setEditingApi(item.name);
    setFormData({
      name: item.name,
      provider: item.provider,
      apiKey: '',
      model: item.model,
      url: item.url,
      enabled: item.enabled
    });
    setShowModal(true);
  };

  const handleDelete = async (apiName) => {
    try {
      const res = await fetch(`${API_URL}/api/api-keys/${apiName}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        fetchApiKeys();
        setDeleteModal({ show: false, apiName: '' });
        showToastMessage('API Key berhasil dihapus!');
      } else {
        showToastMessage('Gagal menghapus API Key: ' + data.message);
      }
    } catch (error) {
      showToastMessage('Gagal menghapus API Key');
    }
  };

  const handleToggleEnabled = async (apiName, currentStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/api-keys/${apiName}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        fetchApiKeys();
        showToastMessage(currentStatus ? 'API Key dinonaktifkan!' : 'API Key diaktifkan!');
      }
    } catch (error) {
      showToastMessage('Gagal mengubah status API Key');
    }
  };

  const handleSyncFromEnv = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/api-keys/sync-from-env`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        fetchApiKeys();
        showToastMessage(`${data.synced} API keys berhasil di-sync dari .env!`);
      } else {
        showToastMessage('Gagal sync API keys: ' + data.error);
      }
    } catch (error) {
      showToastMessage('Gagal sync API keys dari .env');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddProvider = () => {
    const providerKey = newProvider.name.toLowerCase().replace(/\s+/g, '');
    apiProviders[providerKey] = {
      name: newProvider.name,
      url: newProvider.url || '',
      models: newProvider.models.filter(m => m.trim() !== '')
    };
    setShowProviderModal(false);
    setNewProvider({ name: '', url: '', models: [''] });
    showToastMessage(`Provider ${newProvider.name} berhasil ditambahkan!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{toastMessage}</span>
              <button onClick={() => setShowToast(false)} className="ml-2 text-white hover:text-gray-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen API Keys</h1>

          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSyncFromEnv}
              disabled={syncing}
              className="px-5 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? 'Syncing...' : 'Sync dari .env'}
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              + Tambah API Key
            </button>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Provider</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">API Key</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {apiKeys.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                        {apiProviders[item.provider]?.name || item.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.model}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                      {item.apiKey ? `${item.apiKey.substring(0, 10)}...` : '••••••••'}
                    </td>
                    <td className="px-6 py-4">
                      {item.enabled ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Nonaktif
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
                              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)} />
                              <div className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 w-48" 
                                style={{
                                  top: `${document.querySelector(`[data-dropdown="${item.name}"]`)?.getBoundingClientRect().bottom + 5}px`,
                                  right: `${window.innerWidth - document.querySelector(`[data-dropdown="${item.name}"]`)?.getBoundingClientRect().right}px`
                                }}
                              >
                                <button 
                                  onClick={() => {
                                    handleToggleEnabled(item.name, item.enabled);
                                    setDropdownOpen(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition hover:bg-gray-50 ${
                                    item.enabled ? 'text-red-600' : 'text-blue-600'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {item.enabled ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    )}
                                  </svg>
                                  {item.enabled ? 'Nonaktifkan' : 'Aktifkan'}
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
                                  onClick={() => {
                                    setDeleteModal({ show: true, apiName: item.name });
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
                ))}
              </tbody>
            </table>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Informasi API Keys</h4>
              <p className="text-sm text-blue-800 leading-relaxed mb-2">
                API keys digunakan untuk autentikasi dengan provider AI. Pastikan API key valid dan memiliki quota yang cukup. 
                Sistem akan otomatis fallback ke API berikutnya jika ada yang gagal atau limit.
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Pertama kali setup:</strong> Klik tombol "Sync dari .env" untuk mengimpor API keys yang sudah ada di file .env backend.
              </p>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingApi ? 'Edit API Key' : 'Tambah API Key'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Groq Primary"
                    required
                    disabled={editingApi}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.provider}
                      onChange={(e) => {
                        const provider = e.target.value;
                        setFormData({
                          ...formData, 
                          provider,
                          url: apiProviders[provider].url,
                          model: apiProviders[provider].models[0]
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(apiProviders).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowProviderModal(true)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      title="Tambah Provider Baru"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {apiProviders[formData.provider].models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder={editingApi ? "Kosongkan jika tidak ingin mengubah" : "Masukkan API key"}
                    required={!editingApi}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Endpoint</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                    Aktifkan API Key
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingApi(null);
                      setFormData({ name: '', provider: 'groq', apiKey: '', model: '', url: '', enabled: true });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingApi ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus API Key</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus API key <span className="font-semibold">"{deleteModal.apiName}"</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, apiName: '' })}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal.apiName)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Provider Modal */}
        {showProviderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Provider Baru</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Provider</label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: OpenAI, Claude, etc"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Endpoint <span className="text-gray-400 text-xs">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={newProvider.url}
                    onChange={(e) => setNewProvider({...newProvider, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://api.example.com/v1/chat/completions"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bisa diisi nanti saat menambah API key</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Models</label>
                  {newProvider.models.map((model, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => {
                          const updated = [...newProvider.models];
                          updated[index] = e.target.value;
                          setNewProvider({...newProvider, models: updated});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nama model"
                      />
                      {newProvider.models.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newProvider.models.filter((_, i) => i !== index);
                            setNewProvider({...newProvider, models: updated});
                          }}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewProvider({...newProvider, models: [...newProvider.models, '']})}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition text-sm"
                  >
                    + Tambah Model
                  </button>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProviderModal(false);
                      setNewProvider({ name: '', url: '', models: [''] });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProvider}
                    disabled={!newProvider.name || newProvider.models.filter(m => m.trim()).length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tambah Provider
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
