import type { ProjectData } from "../context/ProjectContext";

/** Data proyek Musa Habibulloh Al Faruq — seed ke Firestore via Admin Panel */
export const MUSA_PROJECTS: Omit<ProjectData, "id">[] = [
  {
    name: "Slearn",
    desc: "Platform pembelajaran digital berbasis web & mobile.",
    color: "#5b9bd5",
    mockup: "phones",
    numberColor: "#3a7fc1",
    description:
      "Slearn adalah platform e-learning yang dikembangkan untuk mendukung proses pembelajaran digital. Saya berperan sebagai Mobile & Web Developer, membangun antarmuka dan fitur utama aplikasi.",
    features: [
      "Manajemen materi & modul pembelajaran",
      "Autentikasi pengguna (dosen & mahasiswa)",
      "Tampilan responsif web & aplikasi mobile",
      "Dashboard progress belajar",
    ],
    developedBy: ["Musa Habibulloh Al Faruq"],
    links: [],
  },
  {
    name: "Ukerma",
    desc: "Sistem informasi unit kegiatan mahasiswa berbasis web.",
    color: "#a8d5a2",
    mockup: "browser",
    numberColor: "#5a8f5a",
    description:
      "Ukerma adalah sistem informasi untuk pengelolaan unit kegiatan mahasiswa di Politeknik Negeri Jember. Dikembangkan menggunakan Laravel & Blade, mencakup manajemen anggota, kegiatan, dan laporan.",
    features: [
      "Manajemen data anggota UKM",
      "Pencatatan kegiatan & agenda",
      "Laporan keuangan UKM",
      "Role-based access control (admin & anggota)",
    ],
    developedBy: ["Musa Habibulloh Al Faruq"],
    links: [],
  },
  {
    name: "Dikantin Polije",
    desc: "Aplikasi mobile pemesanan kantin digital Politeknik Negeri Jember.",
    color: "#f39c12",
    mockup: "phone",
    numberColor: "#c47f10",
    description:
      "Dikantin adalah aplikasi mobile untuk memudahkan mahasiswa Politeknik Negeri Jember memesan makanan dari kantin kampus secara digital, mengurangi antrian dan mempercepat transaksi.",
    features: [
      "Katalog menu kantin real-time",
      "Pemesanan & pembayaran digital",
      "Notifikasi status pesanan",
      "Riwayat transaksi pengguna",
    ],
    developedBy: ["Musa Habibulloh Al Faruq"],
    links: [],
  },
  {
    name: "Polaris",
    desc: "Website perpustakaan Politeknik Pelayaran Surabaya.",
    color: "#34495e",
    mockup: "browser",
    numberColor: "#2c3e50",
    description:
      "Polaris adalah sistem informasi perpustakaan berbasis web untuk Politeknik Pelayaran Surabaya. Memudahkan pencarian koleksi buku, peminjaman, dan pengelolaan data pustaka secara digital.",
    features: [
      "Katalog buku & pencarian cepat",
      "Sistem peminjaman & pengembalian",
      "Dashboard admin perpustakaan",
      "Laporan koleksi & statistik pengunjung",
    ],
    developedBy: ["Musa Habibulloh Al Faruq"],
    links: [],
  },
  {
    name: "Parcel Payment DWP Polije",
    desc: "Sistem pembayaran parsel digital untuk DWP Politeknik Negeri Jember.",
    color: "#e74c3c",
    mockup: "browser",
    numberColor: "#c0392b",
    description:
      "Sistem web untuk mengelola dan memproses pembayaran parsel dalam kegiatan Dharma Wanita Persatuan (DWP) Politeknik Negeri Jember, menggantikan pencatatan manual dengan sistem digital.",
    features: [
      "Input & pengelolaan data pesanan parsel",
      "Rekap pembayaran otomatis",
      "Export laporan",
      "Antarmuka ramah pengguna non-teknis",
    ],
    developedBy: ["Musa Habibulloh Al Faruq"],
    links: [],
  },
  {
    name: "M3 Care",
    desc: "Aplikasi kesehatan mobile untuk SMA Muhammadiyah 3 Jember.",
    color: "#9b59b6",
    mockup: "phones",
    numberColor: "#7d3c98",
    description:
      "M3 Care adalah aplikasi mobile kesehatan yang dikembangkan untuk SMA Muhammadiyah 3 Jember. Saya memimpin pengembangan mobile (Lead Mobile Developer) menggunakan Flutter/Dart, mencakup fitur pemantauan kesehatan siswa.",
    features: [
      "Pencatatan data kesehatan siswa",
      "Laporan kesehatan berkala",
      "Notifikasi pengingat pemeriksaan",
      "Dashboard guru/wali kelas",
    ],
    developedBy: ["Musa Habibulloh Al Faruq (Lead Mobile Developer)"],
    links: [],
  },
  {
    name: "UD Barokah Accessories",
    desc: "Aplikasi desktop manajemen toko aksesori.",
    color: "#1abc9c",
    mockup: "laptop",
    numberColor: "#148f77",
    description:
      "Aplikasi desktop untuk UD Barokah Accessories yang membantu pengelolaan stok barang, transaksi penjualan, dan laporan keuangan toko aksesori secara efisien.",
    features: [
      "Manajemen stok barang",
      "Pencatatan transaksi penjualan & pembelian",
      "Laporan keuangan harian/bulanan",
      "Cetak struk & faktur",
    ],
    developedBy: ["Musa Habibulloh Al Faruq"],
    links: [],
  },
  {
    name: "Syncoflow",
    desc: "Aplikasi manajemen meeting & task dengan AI chatbot automation.",
    color: "#2c3e50",
    mockup: "browser",
    numberColor: "#1a252f",
    description:
      "Syncoflow dibuat dalam Refactory Hackathon Universitas Gadjah Mada 2026 (12 Besar). Aplikasi ini membantu pengelolaan meeting dan task dengan fitur chatbot AI untuk otomatisasi alur kerja. Saya berperan sebagai Hacker & Hipster.",
    features: [
      "AI chatbot automation untuk manajemen meeting",
      "Task assignment & tracking",
      "Integrasi kalender otomatis",
      "Ringkasan meeting otomatis oleh AI",
    ],
    developedBy: ["Musa Habibulloh Al Faruq (Hacker & Hipster)"],
    links: [],
  },
];
