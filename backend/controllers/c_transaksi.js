const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { cari_semua_transaksi, cari_item_transaksi, cari_satu_transaksi, simpan_transaksi, simpan_item_transaksi, refund_data_transaksi, kembalikan_stok } = require('../models/m_transaksi');

const tampil_semua_transaksi = async (req, res) => {
    try {
        const ownerId = req.headers['x-owner-id'];
        const { rows, total, p, l } = await cari_semua_transaksi({ ...req.query, ownerId });

        // Untuk setiap transaksi, ambil juga daftar item yang dibeli
        const data = await Promise.all(rows.map(async (r) => ({
            id: r.id,
            invoiceNumber: r.invoice_number,
            customerId: r.customer_id,
            customerName: r.customer_name,
            subtotal: Number(r.subtotal),
            discount: Number(r.discount),
            tax: Number(r.tax),
            total: Number(r.total),
            paymentMethod: r.payment_method,
            amountPaid: Number(r.amount_paid),
            change: Number(r.change_amount),
            status: r.status,
            cashier: r.cashier,
            notes: r.notes,
            createdAt: r.created_at,
            items: await cari_item_transaksi(r.id)
        })));

        res.json({ success: true, data, pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
    } catch (err) {
        console.error('❌ tampil_semua_transaksi Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const buat_transaksi_baru = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const ownerId = req.headers['x-owner-id'];
        const { customerId, customerName, items, paymentMethod, amountPaid, discount = 0, notes = '', cashier = 'Admin' } = req.body;

        // Validasi keranjang tidak boleh kosong
        if (!items || items.length === 0) throw new Error('Keranjang belanja kosong');

        // Hitung subtotal dan total setelah diskon
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const total = subtotal - discount;

        // Buat ID unik dan nomor invoice
        const id = `trx-${uuidv4().slice(0, 8)}`;
        const invoice = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

        // Simpan header transaksi
        await simpan_transaksi(connection, { id, invoice, customerId, customerName, subtotal, discount, total, paymentMethod, amountPaid, change: Number(amountPaid) - total, cashier, notes, ownerId });

        // Simpan setiap item transaksi satu per satu
        for (const item of items) {
            await simpan_item_transaksi(connection, item, id, `txi-${uuidv4().slice(0, 8)}`);
        }

        await connection.commit();
        res.status(201).json({ success: true, data: { id, invoice, total } });
    } catch (err) {
        // Batalkan semua perubahan jika ada error di tengah proses
        await connection.rollback();
        console.error('❌ buat_transaksi_baru Error:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        // Kembalikan koneksi ke pool
        connection.release();
    }
};

const refund_transaksi = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const transaksi = await cari_satu_transaksi(req.params.id);
        if (!transaksi) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
        if (transaksi.status === 'refunded') return res.status(400).json({ success: false, error: 'Transaksi sudah di-refund sebelumnya' });

        // Update status transaksi jadi refunded
        await refund_data_transaksi(connection, req.params.id);

        // Kembalikan stok semua produk yang ada di transaksi ini
        await kembalikan_stok(connection, req.params.id);

        await connection.commit();
        res.json({ success: true, message: 'Transaksi berhasil di-refund dan stok dikembalikan' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ refund_transaksi Error:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
};

module.exports = { tampil_semua_transaksi, buat_transaksi_baru, refund_transaksi };
