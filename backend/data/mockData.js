const { v4: uuidv4 } = require('uuid');

// ============ CATEGORIES ============
const categories = [
  { id: 'cat-1', name: 'Makanan Ringan', icon: 'cookie', color: '#F59E0B' },
  { id: 'cat-2', name: 'Minuman', icon: 'cup-soda', color: '#3B82F6' },
  { id: 'cat-3', name: 'Sembako', icon: 'wheat', color: '#10B981' },
  { id: 'cat-4', name: 'Rokok', icon: 'cigarette', color: '#EF4444' },
  { id: 'cat-5', name: 'Sabun & Deterjen', icon: 'sparkles', color: '#8B5CF6' },
  { id: 'cat-6', name: 'Bumbu Dapur', icon: 'flame', color: '#F97316' },
  { id: 'cat-7', name: 'Obat-obatan', icon: 'pill', color: '#EC4899' },
  { id: 'cat-8', name: 'ATK', icon: 'pencil', color: '#6366F1' },
  { id: 'cat-9', name: 'Gas & Listrik', icon: 'zap', color: '#14B8A6' },
  { id: 'cat-10', name: 'Es Krim & Frozen', icon: 'snowflake', color: '#06B6D4' },
];

// ============ PRODUCTS ============
const products = [
  { id: 'prod-1', barcode: '8992761136000', name: 'Indomie Goreng', category: 'cat-3', buyPrice: 2800, sellPrice: 3500, stock: 120, minStock: 20, unit: 'pcs', image: null, expiryDate: '2026-08-15', supplier: 'sup-1', salesCount: 450, createdAt: '2025-01-15' },
  { id: 'prod-2', barcode: '8992761136017', name: 'Indomie Kuah Soto', category: 'cat-3', buyPrice: 2800, sellPrice: 3500, stock: 80, minStock: 15, unit: 'pcs', image: null, expiryDate: '2026-07-20', supplier: 'sup-1', salesCount: 320, createdAt: '2025-01-15' },
  { id: 'prod-3', barcode: '8886008101053', name: 'Aqua 600ml', category: 'cat-2', buyPrice: 3000, sellPrice: 4000, stock: 200, minStock: 50, unit: 'botol', image: null, expiryDate: '2027-01-10', supplier: 'sup-2', salesCount: 780, createdAt: '2025-01-15' },
  { id: 'prod-4', barcode: '8886008101060', name: 'Aqua 1500ml', category: 'cat-2', buyPrice: 5500, sellPrice: 7000, stock: 60, minStock: 20, unit: 'botol', image: null, expiryDate: '2027-01-10', supplier: 'sup-2', salesCount: 210, createdAt: '2025-01-20' },
  { id: 'prod-5', barcode: '8991102321020', name: 'Teh Botol Sosro 450ml', category: 'cat-2', buyPrice: 4000, sellPrice: 5000, stock: 90, minStock: 20, unit: 'botol', image: null, expiryDate: '2026-06-30', supplier: 'sup-2', salesCount: 560, createdAt: '2025-01-15' },
  { id: 'prod-6', barcode: '8996001600146', name: 'Beras Premium 5kg', category: 'cat-3', buyPrice: 65000, sellPrice: 75000, stock: 25, minStock: 10, unit: 'karung', image: null, expiryDate: null, supplier: 'sup-3', salesCount: 180, createdAt: '2025-01-15' },
  { id: 'prod-7', barcode: '8993189281014', name: 'Gula Pasir 1kg', category: 'cat-3', buyPrice: 14000, sellPrice: 16000, stock: 40, minStock: 10, unit: 'kg', image: null, expiryDate: null, supplier: 'sup-3', salesCount: 290, createdAt: '2025-01-15' },
  { id: 'prod-8', barcode: '8999999032609', name: 'Minyak Goreng Bimoli 1L', category: 'cat-3', buyPrice: 18000, sellPrice: 21000, stock: 35, minStock: 10, unit: 'botol', image: null, expiryDate: '2026-12-01', supplier: 'sup-3', salesCount: 340, createdAt: '2025-01-20' },
  { id: 'prod-9', barcode: '8991003930018', name: 'Sampoerna Mild 16', category: 'cat-4', buyPrice: 28000, sellPrice: 31000, stock: 50, minStock: 15, unit: 'bungkus', image: null, expiryDate: null, supplier: 'sup-4', salesCount: 620, createdAt: '2025-01-15' },
  { id: 'prod-10', barcode: '8999909407008', name: 'Gudang Garam Filter 12', category: 'cat-4', buyPrice: 22000, sellPrice: 25000, stock: 45, minStock: 15, unit: 'bungkus', image: null, expiryDate: null, supplier: 'sup-4', salesCount: 480, createdAt: '2025-01-15' },
  { id: 'prod-11', barcode: '8999999525705', name: 'Rinso Cair 800ml', category: 'cat-5', buyPrice: 18000, sellPrice: 22000, stock: 30, minStock: 8, unit: 'pouch', image: null, expiryDate: '2027-06-15', supplier: 'sup-5', salesCount: 150, createdAt: '2025-02-01' },
  { id: 'prod-12', barcode: '8999999065652', name: 'Sunlight Lemon 750ml', category: 'cat-5', buyPrice: 12000, sellPrice: 15000, stock: 28, minStock: 8, unit: 'botol', image: null, expiryDate: '2027-05-20', supplier: 'sup-5', salesCount: 170, createdAt: '2025-02-01' },
  { id: 'prod-13', barcode: '8993175536325', name: 'Chitato Original 68g', category: 'cat-1', buyPrice: 8000, sellPrice: 10000, stock: 55, minStock: 12, unit: 'pcs', image: null, expiryDate: '2026-04-15', supplier: 'sup-1', salesCount: 280, createdAt: '2025-01-20' },
  { id: 'prod-14', barcode: '8886016822018', name: 'Pocari Sweat 500ml', category: 'cat-2', buyPrice: 6500, sellPrice: 8000, stock: 70, minStock: 15, unit: 'botol', image: null, expiryDate: '2026-09-25', supplier: 'sup-2', salesCount: 190, createdAt: '2025-02-01' },
  { id: 'prod-15', barcode: '8886008101084', name: 'Kopi Kapal Api Special 65g', category: 'cat-2', buyPrice: 9000, sellPrice: 12000, stock: 40, minStock: 10, unit: 'pcs', image: null, expiryDate: '2026-11-10', supplier: 'sup-1', salesCount: 220, createdAt: '2025-01-25' },
  { id: 'prod-16', barcode: '8998866500326', name: 'Royco Ayam 100g', category: 'cat-6', buyPrice: 5000, sellPrice: 7000, stock: 35, minStock: 8, unit: 'sachet', image: null, expiryDate: '2026-10-05', supplier: 'sup-3', salesCount: 260, createdAt: '2025-02-01' },
  { id: 'prod-17', barcode: '8999999527150', name: 'Telur Ayam 1kg', category: 'cat-3', buyPrice: 26000, sellPrice: 30000, stock: 15, minStock: 5, unit: 'kg', image: null, expiryDate: '2026-02-22', supplier: 'sup-3', salesCount: 390, createdAt: '2025-01-15' },
  { id: 'prod-18', barcode: '8992388130010', name: 'Paracetamol Strip', category: 'cat-7', buyPrice: 3000, sellPrice: 5000, stock: 20, minStock: 5, unit: 'strip', image: null, expiryDate: '2027-03-15', supplier: 'sup-5', salesCount: 45, createdAt: '2025-02-10' },
  { id: 'prod-19', barcode: '8997014020100', name: 'Pulpen Standart AE7', category: 'cat-8', buyPrice: 2000, sellPrice: 3000, stock: 50, minStock: 10, unit: 'pcs', image: null, expiryDate: null, supplier: 'sup-5', salesCount: 60, createdAt: '2025-02-10' },
  { id: 'prod-20', barcode: '8993560024109', name: 'Gas Elpiji 3kg', category: 'cat-9', buyPrice: 18000, sellPrice: 22000, stock: 8, minStock: 3, unit: 'tabung', image: null, expiryDate: null, supplier: 'sup-4', salesCount: 95, createdAt: '2025-01-15' },
  { id: 'prod-21', barcode: '8999999350109', name: 'Walls Magnum Classic', category: 'cat-10', buyPrice: 12000, sellPrice: 15000, stock: 18, minStock: 5, unit: 'pcs', image: null, expiryDate: '2026-05-01', supplier: 'sup-2', salesCount: 75, createdAt: '2025-02-15' },
  { id: 'prod-22', barcode: '8992696413016', name: 'Silver Queen 65g', category: 'cat-1', buyPrice: 12000, sellPrice: 15000, stock: 25, minStock: 5, unit: 'pcs', image: null, expiryDate: '2026-07-15', supplier: 'sup-1', salesCount: 130, createdAt: '2025-02-01' },
  { id: 'prod-23', barcode: '8886008101091', name: 'Le Minerale 600ml', category: 'cat-2', buyPrice: 2500, sellPrice: 3500, stock: 150, minStock: 40, unit: 'botol', image: null, expiryDate: '2027-02-28', supplier: 'sup-2', salesCount: 420, createdAt: '2025-01-20' },
  { id: 'prod-24', barcode: '8991002103009', name: 'Djarum Super 12', category: 'cat-4', buyPrice: 20000, sellPrice: 23000, stock: 38, minStock: 10, unit: 'bungkus', image: null, expiryDate: null, supplier: 'sup-4', salesCount: 350, createdAt: '2025-01-15' },
  { id: 'prod-25', barcode: '8999999049508', name: 'Sabun Lifebuoy 100g', category: 'cat-5', buyPrice: 4000, sellPrice: 6000, stock: 42, minStock: 10, unit: 'pcs', image: null, expiryDate: '2027-08-20', supplier: 'sup-5', salesCount: 110, createdAt: '2025-02-05' },
];

// ============ CUSTOMERS ============
const customers = [
  { id: 'cust-1', name: 'Bu Siti Rahayu', phone: '081234567890', address: 'Jl. Merdeka No. 15, RT 03/RW 02', email: 'siti.rahayu@email.com', loyaltyPoints: 1250, totalSpent: 2850000, totalTransactions: 45, joinDate: '2025-01-15', lastVisit: '2026-02-12', avatar: null, notes: 'Pelanggan setia, biasa belanja tiap pagi' },
  { id: 'cust-2', name: 'Pak Budi Santoso', phone: '081345678901', address: 'Jl. Pahlawan No. 8, RT 01/RW 05', email: null, loyaltyPoints: 890, totalSpent: 1920000, totalTransactions: 32, joinDate: '2025-02-01', lastVisit: '2026-02-11', avatar: null, notes: 'Sering beli rokok dan kopi' },
  { id: 'cust-3', name: 'Mbak Dewi Lestari', phone: '082156789012', address: 'Jl. Kenanga No. 22, RT 05/RW 03', email: 'dewi.lestari@email.com', loyaltyPoints: 2100, totalSpent: 4200000, totalTransactions: 68, joinDate: '2025-01-20', lastVisit: '2026-02-12', avatar: null, notes: 'Pelanggan terbesar, punya warung kecil juga' },
  { id: 'cust-4', name: 'Mas Agus Prasetyo', phone: '085267890123', address: 'Jl. Anggrek No. 5, RT 02/RW 01', email: null, loyaltyPoints: 450, totalSpent: 980000, totalTransactions: 18, joinDate: '2025-03-10', lastVisit: '2026-02-09', avatar: null, notes: '' },
  { id: 'cust-5', name: 'Bu Ratna Wulandari', phone: '087378901234', address: 'Jl. Dahlia No. 11, RT 04/RW 02', email: 'ratna.w@email.com', loyaltyPoints: 720, totalSpent: 1560000, totalTransactions: 25, joinDate: '2025-02-15', lastVisit: '2026-02-10', avatar: null, notes: 'Biasa bayar pakai transfer' },
  { id: 'cust-6', name: 'Pak Hendra Wijaya', phone: '081489012345', address: 'Jl. Mawar No. 3, RT 01/RW 04', email: null, loyaltyPoints: 340, totalSpent: 750000, totalTransactions: 12, joinDate: '2025-04-05', lastVisit: '2026-02-08', avatar: null, notes: 'Kadang ngutang, tapi selalu bayar tepat waktu' },
  { id: 'cust-7', name: 'Mbak Yuni Astuti', phone: '082590123456', address: 'Jl. Melati No. 17, RT 03/RW 01', email: 'yuni.a@email.com', loyaltyPoints: 1560, totalSpent: 3100000, totalTransactions: 52, joinDate: '2025-01-25', lastVisit: '2026-02-12', avatar: null, notes: 'Ibu rumah tangga, belanja mingguan' },
  { id: 'cust-8', name: 'Pak Darmawan', phone: '085601234567', address: 'Jl. Flamboyan No. 9, RT 06/RW 03', email: null, loyaltyPoints: 180, totalSpent: 420000, totalTransactions: 8, joinDate: '2025-06-01', lastVisit: '2026-01-28', avatar: null, notes: 'Pelanggan baru' },
  { id: 'cust-9', name: 'Bu Kartini', phone: '087712345678', address: 'Jl. Cempaka No. 14, RT 02/RW 05', email: null, loyaltyPoints: 950, totalSpent: 2050000, totalTransactions: 35, joinDate: '2025-02-20', lastVisit: '2026-02-11', avatar: null, notes: 'Punya kos-kosan, sering beli banyak' },
  { id: 'cust-10', name: 'Mas Rizky Fauzan', phone: '081823456789', address: 'Jl. Bougenville No. 6, RT 01/RW 02', email: 'rizky.f@email.com', loyaltyPoints: 280, totalSpent: 620000, totalTransactions: 10, joinDate: '2025-05-15', lastVisit: '2026-02-07', avatar: null, notes: 'Mahasiswa, biasa beli mie dan minuman' },
  { id: 'cust-11', name: 'Bu Sumarni', phone: '082934567890', address: 'Jl. Teratai No. 20, RT 04/RW 04', email: null, loyaltyPoints: 1100, totalSpent: 2380000, totalTransactions: 40, joinDate: '2025-01-30', lastVisit: '2026-02-12', avatar: null, notes: 'Langganan gas dan sembako' },
  { id: 'cust-12', name: 'Pak Joko Susilo', phone: '085045678901', address: 'Jl. Sakura No. 12, RT 05/RW 01', email: 'joko.s@email.com', loyaltyPoints: 600, totalSpent: 1340000, totalTransactions: 22, joinDate: '2025-03-01', lastVisit: '2026-02-06', avatar: null, notes: 'Tukang bangunan, beli per proyek' },
];

// ============ TRANSACTIONS ============
function generateTransactions() {
  const paymentMethods = ['cash', 'transfer', 'e-wallet', 'credit'];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'refunded'];
  const transactions = [];

  const sampleItems = [
    [{ productId: 'prod-1', name: 'Indomie Goreng', qty: 5, price: 3500 }, { productId: 'prod-3', name: 'Aqua 600ml', qty: 2, price: 4000 }],
    [{ productId: 'prod-9', name: 'Sampoerna Mild 16', qty: 2, price: 31000 }, { productId: 'prod-15', name: 'Kopi Kapal Api Special', qty: 1, price: 12000 }],
    [{ productId: 'prod-6', name: 'Beras Premium 5kg', qty: 1, price: 75000 }, { productId: 'prod-7', name: 'Gula Pasir 1kg', qty: 2, price: 16000 }, { productId: 'prod-8', name: 'Minyak Goreng Bimoli 1L', qty: 1, price: 21000 }],
    [{ productId: 'prod-5', name: 'Teh Botol Sosro', qty: 3, price: 5000 }, { productId: 'prod-13', name: 'Chitato Original', qty: 2, price: 10000 }],
    [{ productId: 'prod-20', name: 'Gas Elpiji 3kg', qty: 1, price: 22000 }],
    [{ productId: 'prod-11', name: 'Rinso Cair 800ml', qty: 1, price: 22000 }, { productId: 'prod-12', name: 'Sunlight Lemon 750ml', qty: 1, price: 15000 }, { productId: 'prod-25', name: 'Sabun Lifebuoy', qty: 2, price: 6000 }],
    [{ productId: 'prod-10', name: 'Gudang Garam Filter 12', qty: 1, price: 25000 }, { productId: 'prod-3', name: 'Aqua 600ml', qty: 1, price: 4000 }],
    [{ productId: 'prod-17', name: 'Telur Ayam 1kg', qty: 2, price: 30000 }, { productId: 'prod-16', name: 'Royco Ayam', qty: 3, price: 7000 }],
    [{ productId: 'prod-14', name: 'Pocari Sweat 500ml', qty: 2, price: 8000 }, { productId: 'prod-22', name: 'Silver Queen 65g', qty: 1, price: 15000 }],
    [{ productId: 'prod-1', name: 'Indomie Goreng', qty: 10, price: 3500 }, { productId: 'prod-2', name: 'Indomie Kuah Soto', qty: 10, price: 3500 }],
  ];

  const customerIds = customers.map(c => c.id);
  const employeeNames = ['Rina', 'Andi', 'Sari'];

  for (let i = 0; i < 35; i++) {
    const items = sampleItems[i % sampleItems.length];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = i % 7 === 0 ? Math.floor(subtotal * 0.05) : 0;
    const total = subtotal - discount;
    const day = String(Math.max(1, 12 - Math.floor(i / 3))).padStart(2, '0');
    const hour = String(8 + (i % 12)).padStart(2, '0');

    transactions.push({
      id: `trx-${String(i + 1).padStart(3, '0')}`,
      invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`,
      customerId: customerIds[i % customerIds.length],
      customerName: customers[i % customers.length].name,
      items: items.map(it => ({ ...it, subtotal: it.price * it.qty })),
      subtotal,
      discount,
      tax: 0,
      total,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      amountPaid: total + (i % 3 === 0 ? 500 : 0),
      change: i % 3 === 0 ? 500 : 0,
      status: statuses[i % statuses.length],
      cashier: employeeNames[i % employeeNames.length],
      notes: i % 5 === 0 ? 'Pelanggan minta plastik' : '',
      createdAt: `2026-02-${day}T${hour}:${String(15 + i % 45).padStart(2, '0')}:00`,
    });
  }
  return transactions;
}

const transactions = generateTransactions();

// ============ DEBTS ============
const debts = [
  { id: 'debt-1', customerId: 'cust-6', customerName: 'Pak Hendra Wijaya', amount: 125000, paidAmount: 50000, remaining: 75000, items: 'Beras 5kg, Minyak Goreng, Gula 1kg', dueDate: '2026-02-20', status: 'partial', createdAt: '2026-02-05', payments: [{ amount: 50000, date: '2026-02-10', method: 'cash' }], reminderSent: false },
  { id: 'debt-2', customerId: 'cust-4', customerName: 'Mas Agus Prasetyo', amount: 45000, paidAmount: 0, remaining: 45000, items: 'Indomie 10pcs, Aqua 5pcs', dueDate: '2026-02-15', status: 'unpaid', createdAt: '2026-02-08', payments: [], reminderSent: true },
  { id: 'debt-3', customerId: 'cust-10', customerName: 'Mas Rizky Fauzan', amount: 78000, paidAmount: 0, remaining: 78000, items: 'Rokok 2bgks, Kopi, Snack', dueDate: '2026-02-18', status: 'unpaid', createdAt: '2026-02-10', payments: [], reminderSent: false },
  { id: 'debt-4', customerId: 'cust-8', customerName: 'Pak Darmawan', amount: 250000, paidAmount: 250000, remaining: 0, items: 'Gas 2 tabung, Sembako lengkap', dueDate: '2026-02-12', status: 'paid', createdAt: '2026-02-01', payments: [{ amount: 150000, date: '2026-02-05', method: 'cash' }, { amount: 100000, date: '2026-02-10', method: 'transfer' }], reminderSent: false },
  { id: 'debt-5', customerId: 'cust-9', customerName: 'Bu Kartini', amount: 180000, paidAmount: 80000, remaining: 100000, items: 'Deterjen, Sabun, Shampo, dll', dueDate: '2026-02-25', status: 'partial', createdAt: '2026-02-07', payments: [{ amount: 80000, date: '2026-02-12', method: 'e-wallet' }], reminderSent: false },
  { id: 'debt-6', customerId: 'cust-2', customerName: 'Pak Budi Santoso', amount: 62000, paidAmount: 0, remaining: 62000, items: 'Rokok Sampoerna 2bgks', dueDate: '2026-02-13', status: 'overdue', createdAt: '2026-02-03', payments: [], reminderSent: true },
];

// ============ SUPPLIERS ============
const suppliers = [
  { id: 'sup-1', name: 'PT Indofood CBP', contact: 'Pak Wahyu', phone: '021-8765432', email: 'order@indofood.co.id', address: 'Jl. Industri No. 100, Jakarta', paymentTerms: 'Net 30', rating: 4.5, totalOrders: 24, lastOrder: '2026-02-01', products: ['Indomie', 'Chitato', 'Kopi Kapal Api', 'Silver Queen'] },
  { id: 'sup-2', name: 'PT Danone Indonesia', contact: 'Bu Mega', phone: '021-7654321', email: 'supply@danone.co.id', address: 'Jl. Raya Bekasi KM 25', paymentTerms: 'Net 14', rating: 4.8, totalOrders: 18, lastOrder: '2026-02-05', products: ['Aqua', 'Le Minerale', 'Pocari Sweat', 'Walls'] },
  { id: 'sup-3', name: 'UD Berkah Sembako', contact: 'Pak Rudi', phone: '0341-567890', email: null, address: 'Pasar Besar Malang Blok A-12', paymentTerms: 'COD', rating: 4.2, totalOrders: 30, lastOrder: '2026-02-10', products: ['Beras', 'Gula', 'Minyak Goreng', 'Telur', 'Royco'] },
  { id: 'sup-4', name: 'CV Jaya Abadi Tobacco', contact: 'Mas Doni', phone: '031-4567890', email: 'order@jayaabadi.com', address: 'Jl. Ahmad Yani No. 50, Surabaya', paymentTerms: 'Net 7', rating: 4.0, totalOrders: 15, lastOrder: '2026-02-08', products: ['Sampoerna Mild', 'Gudang Garam', 'Djarum Super', 'Gas Elpiji'] },
  { id: 'sup-5', name: 'PT Unilever Distribution', contact: 'Bu Fitri', phone: '021-3456789', email: 'dist@unilever.co.id', address: 'Jl. Gatot Subroto, Jakarta', paymentTerms: 'Net 21', rating: 4.7, totalOrders: 12, lastOrder: '2026-02-03', products: ['Rinso', 'Sunlight', 'Lifebuoy', 'Paracetamol', 'Pulpen'] },
];

// ============ EMPLOYEES ============
const employees = [
  { id: 'emp-1', name: 'Rina Marlina', role: 'Kasir Senior', phone: '081234000001', email: 'rina@warung.com', salary: 2500000, joinDate: '2025-01-15', status: 'active', shift: 'pagi', salesTarget: 5000000, currentSales: 4200000, totalTransactions: 156, rating: 4.8, avatar: null },
  { id: 'emp-2', name: 'Andi Kurniawan', role: 'Kasir', phone: '081234000002', email: 'andi@warung.com', salary: 2200000, joinDate: '2025-03-01', status: 'active', shift: 'siang', salesTarget: 4000000, currentSales: 3800000, totalTransactions: 134, rating: 4.5, avatar: null },
  { id: 'emp-3', name: 'Sari Dewi', role: 'Kasir Part-time', phone: '081234000003', email: 'sari@warung.com', salary: 1500000, joinDate: '2025-06-01', status: 'active', shift: 'malam', salesTarget: 3000000, currentSales: 2100000, totalTransactions: 89, rating: 4.2, avatar: null },
  { id: 'emp-4', name: 'Bambang Setiawan', role: 'Staff Gudang', phone: '081234000004', email: 'bambang@warung.com', salary: 2000000, joinDate: '2025-02-15', status: 'active', shift: 'pagi', salesTarget: 0, currentSales: 0, totalTransactions: 0, rating: 4.6, avatar: null },
];

// ============ STORE SETTINGS ============
const storeSettings = {
  name: 'Warung Berkah Jaya',
  address: 'Jl. Raya Soekarno-Hatta No. 45, Malang',
  phone: '0341-123456',
  email: 'warungberkahjaya@email.com',
  owner: 'H. Ahmad Fauzi',
  taxRate: 0,
  currency: 'IDR',
  logo: null,
  operatingHours: { open: '06:00', close: '22:00' },
  darkMode: false,
};

// ============ DAILY SUMMARY ============
const dailySummary = {
  today: {
    revenue: 3250000,
    transactions: 28,
    customers: 15,
    profit: 680000,
    avgTransactionValue: 116071,
  },
  yesterday: {
    revenue: 2890000,
    transactions: 24,
    customers: 12,
    profit: 590000,
    avgTransactionValue: 120417,
  },
  thisMonth: {
    revenue: 38500000,
    transactions: 312,
    customers: 45,
    profit: 7800000,
    topProduct: 'Sampoerna Mild 16',
    topCustomer: 'Mbak Dewi Lestari',
  },
  lastMonth: {
    revenue: 35200000,
    transactions: 285,
    customers: 42,
    profit: 7100000,
  },
};

// ============ SALES CHART DATA ============
const salesChartData = {
  weekly: [
    { day: 'Sen', revenue: 4200000, transactions: 35 },
    { day: 'Sel', revenue: 3800000, transactions: 31 },
    { day: 'Rab', revenue: 4500000, transactions: 38 },
    { day: 'Kam', revenue: 3600000, transactions: 29 },
    { day: 'Jum', revenue: 5100000, transactions: 42 },
    { day: 'Sab', revenue: 6200000, transactions: 52 },
    { day: 'Min', revenue: 5800000, transactions: 48 },
  ],
  monthly: [
    { month: 'Sep', revenue: 28000000 },
    { month: 'Okt', revenue: 31000000 },
    { month: 'Nov', revenue: 33500000 },
    { month: 'Des', revenue: 42000000 },
    { month: 'Jan', revenue: 35200000 },
    { month: 'Feb', revenue: 38500000 },
  ],
};

// ============ NOTIFICATIONS ============
const notifications = [
  { id: 'notif-1', type: 'stock_alert', title: 'Stok Rendah', message: 'Gas Elpiji 3kg tersisa 8 tabung (minimum: 3)', read: false, createdAt: '2026-02-12T08:00:00' },
  { id: 'notif-2', type: 'debt_reminder', title: 'Hutang Jatuh Tempo', message: 'Hutang Pak Budi Santoso Rp 62.000 sudah melewati jatuh tempo', read: false, createdAt: '2026-02-12T07:00:00' },
  { id: 'notif-3', type: 'expiry_alert', title: 'Produk Segera Expired', message: 'Telur Ayam 1kg akan expired pada 22 Feb 2026', read: false, createdAt: '2026-02-12T06:00:00' },
  { id: 'notif-4', type: 'achievement', title: 'Target Tercapai!', message: 'Kasir Andi berhasil mencapai 95% target bulan ini', read: true, createdAt: '2026-02-11T18:00:00' },
  { id: 'notif-5', type: 'stock_alert', title: 'Stok Rendah', message: 'Telur Ayam 1kg tersisa 15 kg (minimum: 5)', read: true, createdAt: '2026-02-11T10:00:00' },
];

// ============ SHIFTS ============
const shifts = [
  { id: 'shift-1', employee: 'emp-1', employeeName: 'Rina Marlina', type: 'pagi', startTime: '06:00', endTime: '14:00', date: '2026-02-12', status: 'active', openingCash: 500000, currentCash: 2150000, transactions: 18 },
  { id: 'shift-2', employee: 'emp-2', employeeName: 'Andi Kurniawan', type: 'siang', startTime: '14:00', endTime: '20:00', date: '2026-02-12', status: 'upcoming', openingCash: 0, currentCash: 0, transactions: 0 },
  { id: 'shift-3', employee: 'emp-3', employeeName: 'Sari Dewi', type: 'malam', startTime: '20:00', endTime: '22:00', date: '2026-02-12', status: 'upcoming', openingCash: 0, currentCash: 0, transactions: 0 },
];

module.exports = {
  categories,
  products,
  customers,
  transactions,
  debts,
  suppliers,
  employees,
  storeSettings,
  dailySummary,
  salesChartData,
  notifications,
  shifts,
};
