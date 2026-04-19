import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../tema';
import api from '../layanan/api';

// ─── TIPE DATA KONTEKS ────────────────────────────────────
interface TipeKonteksApp {
    modeMalam: boolean;
    ubahModeMalam: () => void;
    tema: string;
    aturTema: (tema: string) => void;
    warna: any;
    keranjang: any[];
    tambahKeKeranjang: (produk: any, jumlah?: number) => void;
    hapusDariKeranjang: (idProduk: string) => void;
    ubahJumlahKeranjang: (idProduk: string, jumlah: number) => void;
    kosongkanKeranjang: () => void;
    totalKeranjang: number;
    jumlahKeranjang: number;
    notifikasi: any[];
    jumlahBelumDibaca: number;
    ambilNotifikasi: () => Promise<void>;
    bacaNotifikasi: (id: string) => Promise<void>;
    hapusNotifikasi: () => Promise<void>;
    dataDasbor: any;
    ambilDataDasbor: () => Promise<void>;
    prosesMemuat: boolean;
    sudahMasuk: boolean;
    prosesAuthMemuat: boolean;
    aturSudahMasuk: (nilai: boolean) => void;
    pengguna: any;
    ambilProfilPengguna: () => Promise<void>;
    perbaruiPengguna: (data: any) => Promise<void>;
}

const KonteksApp = createContext<TipeKonteksApp | undefined>(undefined);

// ─── HOOK UNTUK MENGGUNAKAN KONTEKS ──────────────────────
export const gunakanApp = () => {
    const konteks = useContext(KonteksApp);
    if (!konteks) throw new Error('gunakanApp harus digunakan di dalam PenyediaApp');
    return konteks;
};

// Alias untuk kompatibilitas dengan kode lama
export const useApp = gunakanApp;

// ─── KOMPONEN PENYEDIA KONTEKS ────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    // ─── STATE TEMA & TAMPILAN ────────────────────────────
    const [tema, aturTemaState] = useState('light');
    const [modeMalam, setModeMalam] = useState(false);

    // ─── STATE AUTENTIKASI ────────────────────────────────
    const [sudahMasuk, aturSudahMasukState] = useState(false);
    const [prosesAuthMemuat, setProsesAuthMemuat] = useState(true);

    // ─── STATE KERANJANG ──────────────────────────────────
    const [keranjang, setKeranjang] = useState<any[]>([]);

    // ─── STATE DATA APLIKASI ──────────────────────────────
    const [notifikasi, setNotifikasi] = useState<any[]>([]);
    const [dataDasbor, setDataDasbor] = useState<any>(null);
    const [prosesMemuat, setProsesMemuat] = useState(false);
    const [pengguna, setPengguna] = useState<any>(null);

    // ─── CEK STATUS LOGIN & TEMA SAAT PERTAMA BUKA ───────
    useEffect(() => {
        const cekStatusLogin = async () => {
            try {
                // Tampilkan splash screen minimal 2 detik
                await new Promise(resolve => setTimeout(resolve, 2000));

                const sesi = await AsyncStorage.getItem('sesiPengguna');
                if (sesi) {
                    const { waktu } = JSON.parse(sesi);
                    const sekarang = Date.now();
                    const TIGA_PULUH_MENIT = 30 * 60 * 1000;

                    if (sekarang - waktu < TIGA_PULUH_MENIT) {
                        // Sesi masih valid, perbarui waktu
                        aturSudahMasukState(true);
                        await AsyncStorage.setItem('sesiPengguna', JSON.stringify({ waktu: sekarang }));
                    } else {
                        // Sesi sudah kedaluwarsa, hapus
                        await AsyncStorage.removeItem('sesiPengguna');
                        aturSudahMasukState(false);
                    }
                }
            } catch (error) {
                console.error('Gagal memeriksa status login', error);
            } finally {
                setProsesAuthMemuat(false);
            }
        };

        const muatTema = async () => {
            try {
                const temaTersimpan = await AsyncStorage.getItem('temaPengguna');
                if (temaTersimpan) {
                    aturTemaState(temaTersimpan);
                    setModeMalam(temaTersimpan === 'dark');
                }
            } catch (err) {
                console.log('Gagal memuat tema');
            }
        };

        cekStatusLogin();
        muatTema();
    }, []);

    // ─── PERBARUI SESI SAAT APP BERPINDAH STATUS ─────────
    useEffect(() => {
        const langganan = AppState.addEventListener('change', statusAppBerikutnya => {
            if (statusAppBerikutnya === 'active' || statusAppBerikutnya.match(/inactive|background/)) {
                AsyncStorage.getItem('sesiPengguna').then(sesi => {
                    if (sesi) {
                        // Perbarui waktu sesi agar tidak kedaluwarsa
                        AsyncStorage.setItem('sesiPengguna', JSON.stringify({ waktu: Date.now() }));
                    }
                });
            }
        });

        return () => {
            langganan.remove();
        };
    }, []);

    // ─── FUNGSI ATUR STATUS LOGIN ─────────────────────────
    const aturSudahMasuk = async (nilai: boolean) => {
        aturSudahMasukState(nilai);
        try {
            if (nilai) {
                // Simpan sesi baru saat login
                await AsyncStorage.setItem('sesiPengguna', JSON.stringify({ waktu: Date.now() }));
            } else {
                // Hapus sesi dan data pengguna saat logout
                await AsyncStorage.removeItem('sesiPengguna');
                await AsyncStorage.removeItem('idPengguna');
                await AsyncStorage.removeItem('userId');
                // Reset semua state agar data user lama tidak terbawa ke user berikutnya
                setPengguna(null);
                setDataDasbor(null);
                setNotifikasi([]);
                setKeranjang([]);
            }
        } catch (error) {
            console.error('Gagal memperbarui penyimpanan sesi', error);
        }
    };

    // ─── FUNGSI ATUR TEMA ─────────────────────────────────
    const aturTema = async (temaBaru: string) => {
        aturTemaState(temaBaru);
        setModeMalam(temaBaru === 'dark');
        try {
            await AsyncStorage.setItem('temaPengguna', temaBaru);
        } catch (e) {
            console.log('Gagal menyimpan tema');
        }
    };

    // @ts-ignore
    const warna = Colors[tema] || Colors.light;

    // ─── FUNGSI UBAH MODE MALAM ───────────────────────────
    const ubahModeMalam = () => {
        const temaBaru = tema === 'dark' ? 'light' : 'dark';
        aturTema(temaBaru);
    };

    // ─── OPERASI KERANJANG BELANJA ────────────────────────

    // Tambah produk ke keranjang, jika sudah ada tambah jumlahnya
    const tambahKeKeranjang = (produk: any, jumlah: number = 1) => {
        setKeranjang(sebelumnya => {
            const sudahAda = sebelumnya.find(item => item.productId === produk.id);
            if (sudahAda) {
                return sebelumnya.map(item =>
                    item.productId === produk.id
                        ? { ...item, qty: item.qty + jumlah }
                        : item
                );
            }
            return [...sebelumnya, {
                productId: produk.id,
                name: produk.name,
                price: produk.sellPrice,
                qty: jumlah,
                stock: produk.stock,
            }];
        });
    };

    // Hapus produk dari keranjang berdasarkan ID
    const hapusDariKeranjang = (idProduk: string) => {
        setKeranjang(sebelumnya => sebelumnya.filter(item => item.productId !== idProduk));
    };

    // Ubah jumlah produk di keranjang, hapus jika jumlah 0
    const ubahJumlahKeranjang = (idProduk: string, jumlah: number) => {
        if (jumlah <= 0) return hapusDariKeranjang(idProduk);
        setKeranjang(sebelumnya => sebelumnya.map(item =>
            item.productId === idProduk ? { ...item, qty: jumlah } : item
        ));
    };

    // Kosongkan semua isi keranjang
    const kosongkanKeranjang = () => setKeranjang([]);

    // Hitung total harga dan jumlah item di keranjang
    const totalKeranjang = keranjang.reduce((jumlah, item) => jumlah + (item.price * item.qty), 0);
    const jumlahKeranjang = keranjang.reduce((jumlah, item) => jumlah + item.qty, 0);

    // ─── AMBIL DATA DASBOR ────────────────────────────────
    const ambilDataDasbor = useCallback(async () => {
        try {
            setProsesMemuat(true);
            const hasil = await api.get('/reports/dashboard');
            setDataDasbor(hasil.data.data);
            setNotifikasi(hasil.data.data.notifications || []);
        } catch (err: any) {
            console.log('Gagal ambil data dasbor:', err.message);
        } finally {
            setProsesMemuat(false);
        }
    }, []);

    // ─── AMBIL SEMUA NOTIFIKASI ───────────────────────────
    const ambilNotifikasi = useCallback(async () => {
        try {
            const hasil = await api.get('/reports/notifications');
            if (hasil.data.success) {
                setNotifikasi(hasil.data.data);
            }
        } catch (err: any) {
            console.log('Gagal ambil notifikasi:', err.message);
        }
    }, []);

    // ─── TANDAI NOTIFIKASI SUDAH DIBACA ──────────────────
    const bacaNotifikasi = async (id: string) => {
        try {
            await api.put(`/reports/notifications/${id}/read`);
            // Update state lokal langsung tanpa fetch ulang
            setNotifikasi(prev => prev.map(n =>
                (id === 'read-all' || n.id === id) ? { ...n, isRead: true } : n
            ));
        } catch (err: any) {
            console.log('Gagal tandai notifikasi:', err.message);
        }
    };

    // ─── HAPUS NOTIFIKASI YANG SUDAH DIBACA ──────────────
    const hapusNotifikasi = async () => {
        try {
            await api.delete('/reports/notifications/clear');
            setNotifikasi(prev => prev.filter(n => !n.isRead));
        } catch (err: any) {
            console.log('Gagal hapus notifikasi:', err.message);
        }
    };

    // ─── AMBIL PROFIL PENGGUNA ────────────────────────────
    const ambilProfilPengguna = useCallback(async () => {
        try {
            // Cek kedua key: 'idPengguna' (baru) dan 'userId' (lama dari v_halaman_masuk)
            const idPengguna = await AsyncStorage.getItem('idPengguna')
                || await AsyncStorage.getItem('userId');
            if (idPengguna) {
                const hasil = await api.get(`/employees/${idPengguna}`);
                if (hasil.data.success) {
                    setPengguna(hasil.data.data);
                    // Normalisasi ke key baru agar konsisten
                    await AsyncStorage.setItem('idPengguna', idPengguna);
                }
            }
        } catch (err: any) {
            console.log('Gagal ambil profil pengguna:', err.message);
        }
    }, []);

    // ─── PERBARUI DATA PENGGUNA LOKAL ─────────────────────
    const perbaruiPengguna = async (data: any) => {
        // Reset data lama dulu sebelum set data user baru
        setDataDasbor(null);
        setNotifikasi([]);
        setKeranjang([]);
        setPengguna((sebelumnya: any) => {
            const dataBaru = { ...sebelumnya, ...data };
            if (data.id) {
                AsyncStorage.setItem('idPengguna', data.id);
            }
            return dataBaru;
        });
    };

    // Ambil data saat pengguna berhasil login
    useEffect(() => {
        if (sudahMasuk) {
            ambilProfilPengguna();
            ambilDataDasbor();
        }
    }, [sudahMasuk, ambilProfilPengguna, ambilDataDasbor]);

    // Hitung notifikasi yang belum dibaca
    const jumlahBelumDibaca = notifikasi.filter(n => !n.isRead).length;

    // ─── NILAI KONTEKS YANG DIEKSPOR ─────────────────────
    const nilai: TipeKonteksApp = {
        modeMalam,
        ubahModeMalam,
        tema,
        aturTema,
        warna,
        keranjang,
        tambahKeKeranjang,
        hapusDariKeranjang,
        ubahJumlahKeranjang,
        kosongkanKeranjang,
        totalKeranjang,
        jumlahKeranjang,
        notifikasi,
        jumlahBelumDibaca,
        ambilNotifikasi,
        bacaNotifikasi,
        hapusNotifikasi,
        dataDasbor,
        ambilDataDasbor,
        prosesMemuat,
        sudahMasuk,
        prosesAuthMemuat,
        aturSudahMasuk,
        pengguna,
        ambilProfilPengguna,
        perbaruiPengguna,
    };

    return <KonteksApp.Provider value={nilai}>{children}</KonteksApp.Provider>;
};
