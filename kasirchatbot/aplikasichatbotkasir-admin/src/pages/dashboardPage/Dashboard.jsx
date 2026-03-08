import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getUsers, getChatHistory, getChatMessages } from "../../services/api";
import { connectSocket } from "../../services/socket";

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalDatabases, setTotalDatabases] = useState(0);
  const [chartFilter, setChartFilter] = useState("monthly");
  const [userChartFilter, setUserChartFilter] = useState("monthly");
  const [errorCount, setErrorCount] = useState(0);
  const [topQuestions, setTopQuestions] = useState([]);
  const [todayChats, setTodayChats] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyUsersData, setWeeklyUsersData] = useState([]);
  const [monthlyUsersData, setMonthlyUsersData] = useState([]);
  const [yearlyUsersData, setYearlyUsersData] = useState([]);

  useEffect(() => {
    fetchTotalUsers();
    fetchTotalDatabases();
    fetchChatData();
    fetchAndAnalyzeChats();

    // Setup WebSocket untuk real-time updates
    const socket = connectSocket();
    
    socket.on('user_added', () => {
      console.log('📊 Dashboard: User added, refreshing...');
      fetchTotalUsers();
    });
    
    socket.on('user_updated', () => {
      fetchTotalUsers();
    });
    
    socket.on('user_deleted', () => {
      fetchTotalUsers();
    });
    
    socket.on('user_status_changed', () => {
      fetchTotalUsers();
    });
    
    socket.on('new_chat', () => {
      console.log('📊 Dashboard: New chat, refreshing...');
      fetchChatData();
      fetchAndAnalyzeChats();
    });
    
    socket.on('new_message', () => {
      console.log('📊 Dashboard: New message, refreshing...');
      fetchChatData();
      fetchAndAnalyzeChats();
    });

    return () => {
      socket.off('user_added');
      socket.off('user_updated');
      socket.off('user_deleted');
      socket.off('user_status_changed');
      socket.off('new_chat');
      socket.off('new_message');
    };
  }, []);

  const fetchAndAnalyzeChats = async () => {
    try {
      const allChats = await getChatHistory();
      if (allChats && allChats.length > 0) {
        await analyzeFrequentQuestions(allChats);
        await calculateTodayChats(allChats);
      }
    } catch (error) {
      console.error('Error fetching and analyzing chats:', error);
    }
  };

  const analyzeFrequentQuestions = async (allChats) => {
    const questionCount = {};
    
    for (const chat of allChats) {
      try {
        const messages = await getChatMessages(chat.id);
        const userMessages = messages.filter(msg => msg.peran === 'user');
        
        userMessages.forEach(msg => {
          const content = msg.konten.toLowerCase().trim();
          if (content) {
            questionCount[content] = (questionCount[content] || 0) + 1;
          }
        });
      } catch (error) {
        console.error(`Error fetching messages for chat ${chat.id}:`, error);
      }
    }
    
    const sortedQuestions = Object.entries(questionCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([question, count]) => ({
        name: question,
        value: count,
        color: "#1e40af"
      }));
    
    if (sortedQuestions.length > 0) {
      setTopQuestions(sortedQuestions);
    } else {
      setTopQuestions([{ name: "Belum ada data", value: 0, color: "#1e40af" }]);
    }
  };

  const calculateTodayChats = async (allChats) => {
    const today = new Date();
    const todayStr = today.toDateString();
    let todayMessagesCount = 0;
    
    for (const chat of allChats) {
      try {
        const messages = await getChatMessages(chat.id);
        const todayMessages = messages.filter(message => {
          const messageDate = new Date(message.dibuat_pada);
          return messageDate.toDateString() === todayStr;
        });
        todayMessagesCount += todayMessages.length;
      } catch (error) {
        console.error(`Error fetching messages for chat ${chat.id}:`, error);
      }
    }
    
    setTodayChats(todayMessagesCount);
  };

  const fetchChatData = async () => {
    try {
      const data = await getChatHistory();
      if (data && data.length > 0) {
        const weekly = await calculateWeeklyChatData(data);
        const monthly = await calculateMonthlyChatData(data);
        setWeeklyData(weekly);
        setMonthlyData(monthly);
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  };

  const calculateWeeklyChatData = async (chats) => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const counts = Array(7).fill(0);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Hitung total pesan dari semua chat
    for (const chat of chats) {
      try {
        const messages = await getChatMessages(chat.id);
        messages.forEach(message => {
          const messageDate = new Date(message.dibuat_pada);
          if (messageDate >= startOfWeek && messageDate <= today) {
            const dayIndex = messageDate.getDay();
            counts[dayIndex]++;
          }
        });
      } catch (error) {
        console.error(`Error fetching messages for chat ${chat.id}:`, error);
      }
    }

    return days.map((name, index) => ({ name, chats: counts[index] }));
  };

  const calculateMonthlyChatData = async (chats) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const counts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    // Hitung total pesan dari semua chat
    for (const chat of chats) {
      try {
        const messages = await getChatMessages(chat.id);
        messages.forEach(message => {
          const messageDate = new Date(message.dibuat_pada);
          if (messageDate.getFullYear() === currentYear) {
            const monthIndex = messageDate.getMonth();
            counts[monthIndex]++;
          }
        });
      } catch (error) {
        console.error(`Error fetching messages for chat ${chat.id}:`, error);
      }
    }

    return months.map((name, index) => ({ name, chats: counts[index] }));
  };

  const fetchTotalDatabases = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/databases');
      const data = await res.json();
      if (data.success) {
        setTotalDatabases(data.databases.length);
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const data = await getUsers();
      if (data.success) {
        setTotalUsers(data.users.length);
        const activeUsers = data.users.filter((user) => user.status === "active");
        setActiveUsers(activeUsers.length);
        
        // Hitung data user per periode
        calculateUserData(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const calculateUserData = (users) => {
    // Mingguan
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const weeklyCounts = Array(7).fill(0);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    users.forEach(user => {
      const userDate = new Date(user.dibuat_pada);
      if (userDate >= startOfWeek && userDate <= today) {
        const dayIndex = userDate.getDay();
        weeklyCounts[dayIndex]++;
      }
    });
    setWeeklyUsersData(days.map((name, index) => ({ name, users: weeklyCounts[index] })));

    // Bulanan
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyCounts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    users.forEach(user => {
      const userDate = new Date(user.dibuat_pada);
      if (userDate.getFullYear() === currentYear) {
        const monthIndex = userDate.getMonth();
        monthlyCounts[monthIndex]++;
      }
    });
    setMonthlyUsersData(months.map((name, index) => ({ name, users: monthlyCounts[index] })));

    // Tahunan (2026-2031)
    const yearCounts = {};
    users.forEach(user => {
      const year = new Date(user.dibuat_pada).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    const years = [2026, 2027, 2028, 2029, 2030, 2031];
    setYearlyUsersData(years.map(year => ({ name: year.toString(), users: yearCounts[year] || 0 })));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat
            title="Total Pengguna"
            value={totalUsers.toString()}
            change="+0%"
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            color="blue"
          />
          <Stat
            title="Chat Hari Ini"
            value={todayChats.toString()}
            change="+0%"
            icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            color="green"
          />
          <Stat
            title="Pengguna Aktif"
            value={activeUsers.toString()}
            change="+5%"
            icon="M12 3c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 14c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z"
            color="purple"
          />
          <Stat
            title="Total Database"
            value={totalDatabases.toString()}
            change="+0%"
            icon="M4 7v10c0 2.21 3.589 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.589 4 8 4s8-1.79 8-4M4 7c0-2.21 3.589-4 8-4s8 1.79 8 4m0 5c0 2.21-3.589 4-8 4s8-1.79 8-4"
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Pengguna Baru Bulanan */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Pengguna</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserChartFilter("weekly")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    userChartFilter === "weekly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setUserChartFilter("monthly")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    userChartFilter === "monthly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setUserChartFilter("yearly")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    userChartFilter === "yearly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tahunan
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  userChartFilter === "weekly"
                    ? weeklyUsersData
                    : userChartFilter === "yearly"
                      ? yearlyUsersData
                      : monthlyUsersData
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Chat List */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Chat Tren</h3>
            <div className="space-y-3">
              {topQuestions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-bold">{item.value} kali</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart - Tren Chat dengan Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg relative left-0 font-semibold text-gray-800">Chat</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartFilter("weekly")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  chartFilter === "weekly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setChartFilter("monthly")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  chartFilter === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartFilter === "monthly" ? monthlyData : weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="chats" stroke="#1e40af" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}

function Stat({ title, value, change, icon, color }) {
  const colors = {
    blue: "bg-blue-800",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    orange: "bg-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}
