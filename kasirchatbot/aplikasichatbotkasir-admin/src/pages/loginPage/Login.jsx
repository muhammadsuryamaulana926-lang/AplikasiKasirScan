import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpires = localStorage.getItem("tokenExpires");
    if (token && tokenExpires && Date.now() < parseInt(tokenExpires)) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const response = await loginApi({ email, password });
      
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("tokenExpires", Date.now() + (30 * 60 * 1000)); // 30 menit
        localStorage.setItem("userEmail", email);
        navigate("/", { replace: true });
      } else {
        setError(response.error || "Login gagal");
      }
    } catch (error) {
      setError("Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <img src="/logo_mm-removebg-preview.png" alt="Logo" className="w-32 h-32 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
            <p className="text-gray-500">Silakan masuk sebagai Admin</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="contoh@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi</label>
              <input
                type="password"
                placeholder="* * * * * * * *" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;
