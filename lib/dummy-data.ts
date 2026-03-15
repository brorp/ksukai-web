import {
  LegacyManagedUser,
  LegacyQuestion,
  LegacyTestResult,
} from "./legacy-admin-types";

// Sample admin and apoteker users
export const dummyUsers: LegacyManagedUser[] = [
  {
    id: "admin_1",
    username: "admin",
    password: "admin123",
    name: "Administrator Utama",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "apt_001",
    username: "apt001",
    password: "apt123",
    name: "apt. Siti Nurhaliza, S.Farm.",
    role: "apoteker",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "apt_002",
    username: "apt002",
    password: "apt123",
    name: "apt. Budi Santoso, S.Farm.",
    role: "apoteker",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "apt_003",
    username: "apt003",
    password: "apt123",
    name: "apt. apt. Rina Wijaya, S.Farm.",
    role: "apoteker",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "apt_004",
    username: "apt004",
    password: "apt123",
    name: "apt. Ahmad Hermawan, S.Farm.",
    role: "apoteker",
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "apt_005",
    username: "apt005",
    password: "apt123",
    name: "apt. Dwi Retno, S.Farm.",
    role: "apoteker",
    createdAt: new Date("2024-02-15"),
  },
];

// Generate 200 nursing exam questions
export const dummyQuestions: LegacyQuestion[] = [
  {
    id: 1,
    question:
      "Seorang pasien datang ke apotek mengeluhkan batuk kering setelah mengonsumsi obat hipertensi selama seminggu. Obat manakah yang kemungkinan besar menyebabkan efek samping tersebut?",
    options: {
      a: "Amlodipin",
      b: "Kaptopril",
      c: "Furosemid",
      d: "Spironolakton",
      e: "Valsartan",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 2,
    question:
      "Dalam analisis ABC-VEN, obat yang termasuk dalam kategori 'V' (Vital) namun memiliki nilai investasi yang sangat tinggi (A) harus dikelola dengan?",
    options: {
      a: "Pemesanan dalam jumlah besar untuk stok 1 tahun",
      b: "Pengadaan hanya saat ada pesanan pasien saja",
      c: "Kontrol stok yang sangat ketat dan pemesanan frekuensi tinggi",
      d: "Dihilangkan dari formularium karena terlalu mahal",
      e: "Dibiarkan saja karena pasti dibutuhkan",
    },
    correctAnswer: "c",
    category: "Manajemen Farmasi",
  },
  {
    id: 3,
    question:
      "Berapakah jumlah tablet yang harus diserahkan jika resep tertulis: R/ Paracetamol 250mg, m.f. pulv d.t.d No. X. Sediaan yang tersedia adalah tablet 500mg?",
    options: {
      a: "5 Tablet",
      b: "10 Tablet",
      c: "15 Tablet",
      d: "20 Tablet",
      e: "2,5 Tablet",
    },
    correctAnswer: "a",
    category: "Farmasetika Dasar",
  },
  {
    id: 4,
    question:
      "Pasien didiagnosis menderita hiperurisemia (asam urat). Obat manakah yang bekerja dengan menghambat enzim xanthine oxidase?",
    options: {
      a: "Probenesid",
      b: "Kolkhisin",
      c: "Allopurinol",
      d: "Natrium Diklofenak",
      e: "Piroksikam",
    },
    correctAnswer: "c",
    category: "Farmakologi",
  },
  {
    id: 5,
    question:
      "Penyimpanan vaksin Polio yang benar menurut standar rantai dingin (cold chain) adalah pada suhu?",
    options: {
      a: "25 sampai 30 derajat Celcius",
      b: "8 sampai 15 derajat Celcius",
      c: "2 sampai 8 derajat Celcius",
      d: "-15 sampai -25 derajat Celcius",
      e: "0 sampai 2 derajat Celcius",
    },
    correctAnswer: "d",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 6,
    question:
      "Antidotum yang paling tepat untuk menangani keracunan akut parasetamol adalah?",
    options: {
      a: "Atropin Sulfat",
      b: "N-asetilsistein",
      c: "Nalokson",
      d: "Flumazenil",
      e: "Eritromisin",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 7,
    question:
      "Manakah dari antibiotik berikut yang termasuk dalam golongan Flourokuinolon?",
    options: {
      a: "Amoksisilin",
      b: "Siprofloksasin",
      c: "Sefadroksil",
      d: "Azitromisin",
      e: "Gentamisin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 8,
    question:
      "Seorang apoteker melakukan sterilisasi sediaan injeksi yang tahan panas menggunakan otoklaf. Berapakah suhu dan waktu yang umum digunakan?",
    options: {
      a: "100°C selama 15 menit",
      b: "121°C selama 15 menit",
      c: "150°C selama 30 menit",
      d: "180°C selama 1 jam",
      e: "115°C selama 10 menit",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 9,
    question:
      "Parameter laboratorium manakah yang digunakan untuk memantau keberhasilan terapi antikoagulan oral seperti Warfarin?",
    options: {
      a: "HbA1c",
      b: "Serum Kreatinin",
      c: "INR (International Normalized Ratio)",
      d: "SGOT/SGPT",
      e: "Kadar albumin",
    },
    correctAnswer: "c",
    category: "Patofisiologi & Klinis",
  },
  {
    id: 10,
    question:
      "Penggunaan bersamaan antara Antasida (Mg/Al) dengan Tetrasiklin dapat menurunkan absorpsi antibiotik tersebut melalui mekanisme?",
    options: {
      a: "Induksi enzim metabolisme",
      b: "Pembentukan kompleks kelat",
      c: "Perubahan pH urin",
      d: "Kompetisi ikatan protein plasma",
      e: "Penghambatan sekresi tubular",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 11,
    question:
      "Seorang pasien didiagnosis menderita Diabetes Melitus tipe 2 dan diberikan Metformin. Manakah mekanisme kerja utama dari obat tersebut?",
    options: {
      a: "Meningkatkan sekresi insulin dari sel beta pankreas",
      b: "Menghambat reabsorpsi glukosa di tubulus ginjal",
      c: "Menghambat glukoneogenesis di hati dan meningkatkan sensitivitas insulin",
      d: "Menghambat enzim alfa-glukosidase di usus",
      e: "Meningkatkan sekresi hormon inkretin",
    },
    correctAnswer: "c",
    category: "Farmakologi",
  },
  {
    id: 12,
    question:
      "Seorang Apoteker di bagian QC industri farmasi melakukan uji disolusi tablet. Alat manakah yang digunakan jika menggunakan metode Basket (keranjang)?",
    options: {
      a: "Apparatus 1",
      b: "Apparatus 2",
      c: "Apparatus 3",
      d: "Apparatus 4",
      e: "Apparatus 5",
    },
    correctAnswer: "a",
    category: "Teknologi Farmasi",
  },
  {
    id: 13,
    question:
      "Pasien asma diberikan inhaler tipe MDI. Apoteker menyarankan penggunaan spacer. Apa tujuan utama penggunaan spacer?",
    options: {
      a: "Meningkatkan dosis obat yang disemprotkan",
      b: "Mengurangi deposisi obat di mulut dan tenggorokan",
      c: "Menghilangkan kebutuhan untuk mengocok inhaler",
      d: "Mempercepat onset kerja obat",
      e: "Menggantikan fungsi zat pendorong (propelan)",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 14,
    question:
      "Berapa lama masa berlaku resep narkotika yang telah disimpan di Apotek menurut regulasi di Indonesia?",
    options: {
      a: "1 Tahun",
      b: "2 Tahun",
      c: "3 Tahun",
      d: "5 Tahun",
      e: "10 Tahun",
    },
    correctAnswer: "d",
    category: "Regulasi & Etika",
  },
  {
    id: 15,
    question:
      "Seorang pasien pria 60 tahun dengan riwayat penyakit jantung koroner rutin mengonsumsi ISDN sublingual saat serangan. Apa saran penyimpanan yang paling tepat?",
    options: {
      a: "Disimpan di dalam lemari es agar tidak lumer",
      b: "Disimpan dalam wadah kaca tertutup rapat dan terhindar dari cahaya",
      c: "Dipindahkan ke kotak obat plastik transparan agar mudah dilihat",
      d: "Disimpan di dalam mobil agar selalu siap saat serangan",
      e: "Disimpan bersama obat-obat lain di satu wadah",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 16,
    question:
      "Obat golongan Statin paling efektif diminum pada waktu malam hari. Hal ini dikarenakan?",
    options: {
      a: "Efek samping mual berkurang saat tidur",
      b: "Puncak pembentukan kolesterol oleh hati terjadi pada malam hari",
      c: "Absorpsi obat lebih baik saat perut kosong",
      d: "Menghindari interaksi dengan makanan di siang hari",
      e: "Obat ini menyebabkan efek mengantuk",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 17,
    question:
      "Manakah dari indikator berikut yang digunakan untuk menilai kepatuhan penggunaan obat pasien dalam jangka panjang pada penderita DM?",
    options: {
      a: "Gula Darah Sewaktu (GDS)",
      b: "Gula Darah Puasa (GDP)",
      c: "HbA1c",
      d: "Kadar Insulin puasa",
      e: "Uji toleransi glukosa oral",
    },
    correctAnswer: "c",
    category: "Patofisiologi",
  },
  {
    id: 18,
    question:
      "Suatu industri farmasi ingin membuat sediaan sirup parasetamol. Namun, zat aktif tersebut susah larut dalam air. Teknik apa yang digunakan jika ditambahkan gliserin?",
    options: {
      a: "Solubilisasi",
      b: "Kosolvensi",
      c: "Kompleksasi",
      d: "Salting out",
      e: "Salting in",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 19,
    question:
      "Seorang pasien didiagnosis menderita TBC dan mendapat regimen OAT. Setelah minum obat, urin pasien berubah menjadi warna merah kemerahan. Obat manakah yang menyebabkan hal tersebut?",
    options: {
      a: "Isoniazid",
      b: "Rifampisin",
      c: "Pirazinamid",
      d: "Etambutol",
      e: "Streptomisin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 20,
    question:
      "Dalam perhitungan dosis anak, metode yang menggunakan variabel berat badan adalah?",
    options: {
      a: "Rumus Young",
      b: "Rumus Dilling",
      c: "Rumus Clark",
      d: "Rumus Fried",
      e: "Rumus Thermic",
    },
    correctAnswer: "c",
    category: "Farmasetika Dasar",
  },
  {
    id: 21,
    question:
      "Obat manakah yang harus dihindari pada pasien dengan riwayat tukak lambung karena risiko perdarahan lambung yang tinggi?",
    options: {
      a: "Parasetamol",
      b: "Natrium Diklofenak",
      c: "Sukralfat",
      d: "Simetidin",
      e: "Antasida",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 22,
    question:
      "Metode sterilisasi yang paling tepat untuk sediaan tetes mata yang tidak tahan panas (termolabil) adalah?",
    options: {
      a: "Otoklaf suhu 121 C",
      b: "Oven suhu 170 C",
      c: "Filtrasi membran (penyaringan bakteri)",
      d: "Radiasi sinar Gamma",
      e: "Gas Etilen Oksida",
    },
    correctAnswer: "c",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 23,
    question:
      "Seorang wanita hamil mengalami demam. Manakah analgetik-antipiretik yang paling aman untuk diberikan?",
    options: {
      a: "Aspirin",
      b: "Ibuprofen",
      c: "Parasetamol",
      d: "Asam Mefenamat",
      e: "Piroksikam",
    },
    correctAnswer: "c",
    category: "Farmakologi Ibu dan Bayi",
  },
  {
    id: 24,
    question:
      "Istilah 'Beyond Use Date' (BUD) untuk racikan puyer jika tidak ada data stabilitas spesifik umumnya adalah?",
    options: {
      a: "14 Hari",
      b: "30 Hari",
      c: "60 Hari",
      d: "6 Bulan",
      e: "1 Tahun",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 25,
    question:
      "Antibiotik golongan Aminoglikosida seperti Gentamisin memiliki efek samping toksik yang khas pada?",
    options: {
      a: "Hati dan Ginjal",
      b: "Ginjal dan Pendengaran (Otonefrotoksik)",
      c: "Jantung dan Paru",
      d: "Mata dan Sendi",
      e: "Kulit dan Gigi",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 26,
    question:
      "Fungsi dari penambahan Magnesium Stearat dalam formulasi pembuatan tablet secara granulasi basah adalah sebagai?",
    options: {
      a: "Pengikat",
      b: "Penghancur",
      c: "Lubrikan (Pelicin)",
      d: "Pengisi",
      e: "Pemberi rasa",
    },
    correctAnswer: "c",
    category: "Teknologi Farmasi",
  },
  {
    id: 27,
    question:
      "Seorang apoteker di industri farmasi menghitung nilai HLB (Hydrophile-Lipophile Balance) untuk sediaan emulsi. HLB tinggi (8-18) biasanya digunakan untuk tipe emulsi?",
    options: {
      a: "Air dalam Minyak (A/M)",
      b: "Minyak dalam Air (M/A)",
      c: "W/O/W",
      d: "Salep",
      e: "Supositoria",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 28,
    question:
      "Antidotum untuk keracunan insektisida golongan organofosfat adalah?",
    options: {
      a: "Atropin",
      b: "N-asetilsistein",
      c: "Protamin",
      d: "Dimerkaprol",
      e: "Etanol",
    },
    correctAnswer: "a",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 29,
    question:
      "Obat manakah yang bekerja sebagai agonis reseptor beta-2 di paru-paru untuk melebarkan saluran napas?",
    options: {
      a: "Propranolol",
      b: "Salbutamol",
      c: "Bisoprolol",
      d: "Atenolol",
      e: "Ipratropium",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 30,
    question: "Pemberian Vit K pada bayi baru lahir bertujuan untuk mencegah?",
    options: {
      a: "Infeksi paru",
      b: "Penyakit kuning",
      c: "Perdarahan (Defisiensi faktor koagulasi)",
      d: "Diare akut",
      e: "Kejang demam",
    },
    correctAnswer: "c",
    category: "Apoteker Ibu dan Bayi",
  },
  {
    id: 31,
    question:
      "Obat Digoksin memiliki rentang terapi yang sempit. Gejala khas dari toksisitas digoksin adalah?",
    options: {
      a: "Tinitus (telinga berdenging)",
      b: "Gangguan penglihatan warna kuning-hijau (Xanthopsia)",
      c: "Gusi berdarah",
      d: "Wajah memerah",
      e: "Kaki bengkak",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 32,
    question:
      "Sildenafil (Viagra) tidak boleh digunakan bersamaan dengan Isosorbid Dinitrat (Nitrat) karena risiko?",
    options: {
      a: "Hipertensi berat",
      b: "Hipotensi fatal",
      c: "Gagal ginjal",
      d: "Kerusakan hati",
      e: "Ereksi berkepanjangan",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 33,
    question: "Regimen terapi TBC tahap lanjutan biasanya terdiri dari obat?",
    options: {
      a: "Rifampisin dan Isoniazid",
      b: "Rifampisin dan Etambutol",
      c: "Isoniazid dan Pirazinamid",
      d: "Streptomisin dan Rifampisin",
      e: "Hanya Rifampisin",
    },
    correctAnswer: "a",
    category: "Asuhan Apoteker Dasar",
  },
  {
    id: 34,
    question:
      "Uji stabilitas dipercepat (accelerated stability test) biasanya dilakukan pada kondisi suhu dan kelembaban?",
    options: {
      a: "25 C / 60% RH",
      b: "30 C / 75% RH",
      c: "40 C / 75% RH",
      d: "2 C / 8% RH",
      e: "60 C / 90% RH",
    },
    correctAnswer: "c",
    category: "Teknologi Farmasi",
  },
  {
    id: 35,
    question:
      "Metode pemusnahan obat narkotika yang benar dilakukan dengan cara?",
    options: {
      a: "Dibuang langsung ke tempat sampah umum",
      b: "Dibakar dengan insinerator dan disaksikan petugas resmi",
      c: "Dilarutkan dalam air lalu dibuang ke selokan",
      d: "Dikembalikan ke distributor tanpa berita acara",
      e: "Dikubur di dalam tanah tanpa pengolahan",
    },
    correctAnswer: "b",
    category: "Regulasi & Etika",
  },
  {
    id: 36,
    question: "Loperamid digunakan untuk mengobati diare dengan mekanisme?",
    options: {
      a: "Membunuh bakteri penyebab diare",
      b: "Menyerap racun di usus",
      c: "Memperlambat motilitas usus (agonis opioid reseptor)",
      d: "Meningkatkan sekresi air ke usus",
      e: "Melindungi dinding usus dari iritasi",
    },
    correctAnswer: "c",
    category: "Farmakologi",
  },
  {
    id: 37,
    question:
      "Efek samping 'Red Man Syndrome' terkait dengan infus antibiotik yang terlalu cepat, yaitu obat?",
    options: {
      a: "Siprofloksasin",
      b: "Vankomisin",
      c: "Metronidazol",
      d: "Klindamisin",
      e: "Amoksisilin",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 38,
    question: "Nilai normal kadar kolesterol total adalah?",
    options: {
      a: "< 100 mg/dL",
      b: "< 200 mg/dL",
      c: "< 300 mg/dL",
      d: "< 150 mg/dL",
      e: "> 200 mg/dL",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 39,
    question:
      "Bagian dari tumbuhan Atropa belladonna yang sering digunakan untuk diambil alkaloidnya adalah daun. Kandungan utamanya adalah?",
    options: {
      a: "Morfin",
      b: "Atropin",
      c: "Kinin",
      d: "Kafein",
      e: "Digitalis",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 40,
    question:
      "Interaksi antara Warfarin dan Sayuran hijau (tinggi Vit K) menyebabkan?",
    options: {
      a: "Efek warfarin meningkat (risiko pendarahan)",
      b: "Efek warfarin menurun (risiko pembekuan)",
      c: "Efek warfarin tidak berubah",
      d: "Kerusakan ginjal",
      e: "Alergi berat",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 41,
    question:
      "Manakah dari obat berikut yang bekerja sebagai proton pump inhibitor (PPI)?",
    options: {
      a: "Ranitidin",
      b: "Lansoprazol",
      c: "Famotidin",
      d: "Misoprostol",
      e: "Antasida",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 42,
    question:
      "Sebuah apotek membeli obat seharga Rp 10.000 (inc PPN) dan ingin margin 20%. Berapa harga jual obat tersebut?",
    options: {
      a: "Rp 12.000",
      b: "Rp 12.500",
      c: "Rp 15.000",
      d: "Rp 11.000",
      e: "Rp 13.000",
    },
    correctAnswer: "b",
    category: "Manajemen Farmasi",
  },
  {
    id: 43,
    question:
      "Sediaan suppositoria umumnya menggunakan basis yang meleleh pada suhu tubuh, contohnya adalah?",
    options: {
      a: "PEG 400",
      b: "Oleum Cacao",
      c: "Gelatin",
      d: "Vaselin",
      e: "Adeps Lanae",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 44,
    question:
      "Fase metabolisme obat di hati yang melibatkan reaksi konjugasi disebut?",
    options: {
      a: "Fase 1",
      b: "Fase 2",
      c: "Fase 3",
      d: "Fase Eliminasi",
      e: "Fase Absorpsi",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 45,
    question:
      "Obat asma golongan Metilsantin yang memiliki indeks terapi sempit dan memerlukan pemantauan kadar obat adalah?",
    options: {
      a: "Teofilin",
      b: "Budesonid",
      c: "Terbutalin",
      d: "Zafirlukast",
      e: "Ketotifen",
    },
    correctAnswer: "a",
    category: "Farmakologi Klinis",
  },
  {
    id: 46,
    question:
      "Antibiotik yang dapat menyebabkan perubahan warna gigi permanen dan gangguan tulang jika diberikan pada anak-anak adalah?",
    options: {
      a: "Amoksisilin",
      b: "Tetrasiklin",
      c: "Eritromisin",
      d: "Sefadroksil",
      e: "Kloramfenikol",
    },
    correctAnswer: "b",
    category: "Apoteker Anak",
  },
  {
    id: 47,
    question:
      "Seorang pasien didiagnosis menderita skizofrenia. Obat manakah yang termasuk antipsikotik atipikal?",
    options: {
      a: "Haloperidol",
      b: "Klorpromazin",
      c: "Risperidon",
      d: "Fenobarbital",
      e: "Diazepam",
    },
    correctAnswer: "c",
    category: "Apoteker Jiwa",
  },
  {
    id: 48,
    question:
      "Apa singkatan dari p.r.n dalam instruksi pemakaian obat pada resep?",
    options: {
      a: "Sesudah makan",
      b: "Sebelum makan",
      c: "Jika perlu",
      d: "Segera",
      e: "Malam hari",
    },
    correctAnswer: "c",
    category: "Farmasetika Dasar",
  },
  {
    id: 49,
    question:
      "Metode ekstraksi dingin yang dilakukan dengan cara merendam serbuk simplisia dalam cairan penyari selama beberapa hari disebut?",
    options: {
      a: "Maserasi",
      b: "Perkolasi",
      d: "Refluks",
      e: "Sokletasi",
      c: "Infundasi",
    },
    correctAnswer: "a",
    category: "Farmakognosi",
  },
  {
    id: 50,
    question:
      "Spironolakton adalah obat diuretik yang bekerja pada tubulus distal dengan mekanisme?",
    options: {
      a: "Penghambat karbonik anhidrase",
      b: "Antagonis Aldosteron (Hemat Kalium)",
      c: "Diuretik Kuat (Loop Diuretic)",
      d: "Diuretik Osmotik",
      e: "Penghambat kanal kalsium",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 51,
    question:
      "Obat manakah yang bekerja dengan cara menghambat enzim HMG-CoA reduktase untuk menurunkan kadar kolesterol?",
    options: {
      a: "Gemfibrozil",
      b: "Simvastatin",
      c: "Ezetimibe",
      d: "Kolestiramin",
      e: "Fenofibrat",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 52,
    question:
      "Seorang pasien asma rutin menggunakan Seretide (Salmeterol & Flutikason). Apa fungsi utama Flutikason dalam sediaan tersebut?",
    options: {
      a: "Melebarkan bronkus secara instan",
      b: "Sebagai antiinflamasi untuk mencegah serangan",
      c: "Mengencerkan dahak yang kental",
      d: "Meningkatkan daya tahan tubuh",
      e: "Mengurangi rasa sesak saat aktivitas",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 53,
    question:
      "Kloramfenikol dapat menyebabkan efek samping serius pada bayi baru lahir yang disebut?",
    options: {
      a: "Reye's Syndrome",
      b: "Grey Baby Syndrome",
      c: "Cushing Syndrome",
      d: "Steven-Johnson Syndrome",
      e: "Moon Face",
    },
    correctAnswer: "b",
    category: "Apoteker Ibu dan Bayi",
  },
  {
    id: 54,
    question:
      "Dalam manajemen farmasi, rumus untuk menghitung Harga Pokok Penjualan (HPP) adalah?",
    options: {
      a: "Persediaan Awal + Pembelian - Persediaan Akhir",
      b: "Persediaan Awal - Pembelian + Persediaan Akhir",
      c: "Penjualan - Laba Bersih",
      d: "Persediaan Akhir + Pembelian",
      e: "Total Aset - Hutang",
    },
    correctAnswer: "a",
    category: "Manajemen Farmasi",
  },
  {
    id: 55,
    question:
      "Penyakit asam urat disebabkan oleh penumpukan kristal di sendi. Kristal tersebut berupa?",
    options: {
      a: "Kalsium Oksalat",
      b: "Monosodium Urat",
      c: "Kolesterol",
      d: "Asam Laktat",
      e: "Urea",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 56,
    question:
      "Seorang pasien mengonsumsi sediaan sustained release (lepas lambat). Apa instruksi yang paling penting diberikan apoteker?",
    options: {
      a: "Diminum bersama susu",
      b: "Tablet tidak boleh dikunyah atau dihancurkan",
      c: "Diminum saat perut kosong",
      d: "Diminum hanya jika terasa sakit",
      e: "Dilarutkan dalam air sebelum diminum",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 57,
    question:
      "Metode akuntansi di mana barang yang pertama kali masuk ke gudang adalah yang pertama kali dikeluarkan disebut?",
    options: {
      a: "LIFO",
      b: "FIFO",
      c: "FEFO",
      d: "Average",
      e: "JIT",
    },
    correctAnswer: "b",
    category: "Manajemen Farmasi",
  },
  {
    id: 58,
    question:
      "Obat manakah yang merupakan pilihan pertama (first line) untuk terapi hipertensi pada pasien yang juga menderita diabetes melitus?",
    options: {
      a: "Amlodipin",
      b: "Kandisartan (ARB) / Lisinopril (ACEI)",
      c: "Propranolol",
      d: "Hidroklortiazid",
      e: "Furosemid",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 59,
    question:
      "Seorang apoteker membuat salep dengan basis lemak bulu domba. Apa nama latin dari basis tersebut?",
    options: {
      a: "Cera Alba",
      b: "Adeps Lanae",
      c: "Vaselin Flavum",
      d: "Paraffin Liquidum",
      e: "Cetaceum",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 60,
    question:
      "Antidotum yang digunakan pada kasus overdosis opioid (misal: Morfin/Heroin) adalah?",
    options: {
      a: "Atropin",
      b: "Nalokson",
      c: "Flumazenil",
      d: "Asetilsistein",
      e: "Nitrit",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 61,
    question:
      "Obat batuk yang bekerja menekan pusat batuk di otak (antitusif) adalah?",
    options: {
      a: "Guaifenesin",
      b: "Dekstrometorfan",
      c: "Ambroksol",
      d: "Bromheksin",
      e: "Asetilsistein",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 62,
    question:
      "Kondisi di mana pasien memerlukan dosis obat yang semakin meningkat untuk mendapatkan efek yang sama disebut?",
    options: {
      a: "Idiosinkrasi",
      b: "Toleransi",
      c: "Adiksi",
      d: "Potensiasi",
      e: "Sinergisme",
    },
    correctAnswer: "b",
    category: "Farmakologi Dasar",
  },
  {
    id: 63,
    question:
      "Manakah dari insulin berikut yang termasuk dalam kategori 'Rapid Acting' (kerja sangat cepat)?",
    options: {
      a: "Insulin NPH",
      b: "Insulin Lispro / Aspart",
      c: "Insulin Glargin",
      d: "Insulin Detemir",
      e: "Insulin Reguler",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 64,
    question:
      "Industri farmasi melakukan uji pirogen pada sediaan injeksi volume besar. Hewan uji yang biasanya digunakan adalah?",
    options: {
      a: "Mencit",
      b: "Kelinci",
      c: "Marmut",
      d: "Tikus",
      e: "Kera",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 65,
    question: "Kombinasi Amoksisilin dan Asam Klavulanat bertujuan untuk?",
    options: {
      a: "Meningkatkan absorpsi amoksisilin",
      b: "Menghambat enzim beta-laktamase bakteri",
      c: "Mengurangi efek samping mual",
      d: "Melebarkan spektrum hanya ke bakteri gram positif",
      e: "Meningkatkan ekskresi amoksisilin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 66,
    question:
      "Berapakah nilai perbandingan suhu dalam derajat Reamur (R) terhadap Celcius (C)?",
    options: {
      a: "5:4",
      b: "4:5",
      c: "9:5",
      d: "5:9",
      e: "4:9",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 67,
    question:
      "Seorang apoteker melakukan rekonsiliasi obat. Apa tujuan utama dari kegiatan tersebut?",
    options: {
      a: "Menghitung keuntungan apotek",
      b: "Memastikan akurasi data obat yang digunakan pasien saat perpindahan layanan",
      c: "Melakukan stok opname gudang",
      d: "Mempromosikan obat baru ke dokter",
      e: "Menentukan harga jual obat generik",
    },
    correctAnswer: "b",
    category: "Asuhan Apoteker Dasar",
  },
  {
    id: 68,
    question:
      "Obat manakah yang dapat menyebabkan efek samping berupa 'Gingival Hyperplasia' (pertumbuhan berlebih gusi)?",
    options: {
      a: "Furosemid",
      b: "Fenitoin",
      c: "Diazepam",
      d: "Asam Valproat",
      e: "Klorpromazin",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 69,
    question: "Simplisia 'Curcuma xanthorrhiza' dikenal umum dengan nama?",
    options: {
      a: "Kunyit",
      b: "Temulawak",
      c: "Kencur",
      d: "Jahe",
      e: "Lengkuas",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 70,
    question:
      "Interaksi antara susu yang kaya kalsium dengan Ciprofloxacin akan menyebabkan?",
    options: {
      a: "Toksisitas siprofloksasin meningkat",
      b: "Kegagalan terapi antibiotik karena absorpsi terhambat",
      c: "Susu menjadi beracun",
      d: "Terjadi pengendapan di ginjal",
      e: "Pasien menjadi mengantuk",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 71,
    question: "Sediaan kapsul dengan cangkang keras biasanya terbuat dari?",
    options: {
      a: "Amilum",
      b: "Gelatin",
      c: "Laktosa",
      d: "Selulosa",
      e: "Glukosa",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 72,
    question:
      "Metode analisis kadar obat dengan mengukur serapan cahaya pada panjang gelombang tertentu disebut?",
    options: {
      a: "Titrimetri",
      b: "Spektrofotometri UV-Vis",
      c: "Gravimetri",
      d: "Kromatografi Lapis Tipis",
      e: "Potensiometri",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 73,
    question:
      "Vaksin yang digunakan untuk mencegah penyakit TBC pada bayi adalah?",
    options: {
      a: "DPT",
      b: "BCG",
      c: "Hepatitis B",
      d: "MMR",
      e: "IPV",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 74,
    question: "Bisakodil adalah obat pencahar yang bekerja dengan cara?",
    options: {
      a: "Melunakkan feses",
      b: "Stimulan (merangsang peristaltik usus)",
      c: "Membentuk massa (bulking agent)",
      d: "Osmotik (menarik air)",
      e: "Lubrikan",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 75,
    question:
      "Penggunaan Aspirin pada anak yang sedang mengalami infeksi virus (seperti flu atau cacar air) berisiko menyebabkan?",
    options: {
      a: "Alergi berat",
      b: "Reye's Syndrome",
      c: "Gagal ginjal akut",
      d: "Anemia defisiensi besi",
      e: "Kebutaan",
    },
    correctAnswer: "b",
    category: "Apoteker Anak",
  },
  {
    id: 76,
    question:
      "Dalam pembuatan tablet, masalah di mana bagian atas tablet terpisah dari bagian utama disebut?",
    options: {
      a: "Sticking",
      b: "Capping",
      c: "Mottling",
      d: "Picking",
      e: "Chipping",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 77,
    question:
      "Berapa ml volume satu sendok teh (Cochlear Pultis/cth) menurut Farmakope Indonesia?",
    options: {
      a: "15 ml",
      b: "5 ml",
      c: "10 ml",
      d: "20 ml",
      e: "2,5 ml",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 78,
    question:
      "Obat manakah yang bekerja sebagai antagonis reseptor H2 di lambung?",
    options: {
      a: "Omeprazol",
      b: "Ranitidin",
      c: "Antasida",
      d: "Sukralfat",
      e: "Misoprostol",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 79,
    question:
      "Seorang pasien datang dengan resep 'Iter 1x'. Berapa kali total pasien tersebut bisa mendapatkan obatnya?",
    options: {
      a: "1 kali",
      b: "2 kali",
      c: "3 kali",
      d: "Hanya untuk penebusan pertama",
      e: "Sesuai keinginan pasien",
    },
    correctAnswer: "b",
    category: "Regulasi & Etika",
  },
  {
    id: 80,
    question:
      "Isoniazid (INH) dapat menyebabkan efek samping neuropati perifer. Hal ini dicegah dengan pemberian?",
    options: {
      a: "Vitamin B12",
      b: "Vitamin B6 (Piridoksin)",
      c: "Vitamin C",
      d: "Asam Folat",
      e: "Vitamin E",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 81,
    question:
      "Metode pemisahan campuran berdasarkan perbedaan kecepatan migrasi komponen dalam fase gerak dan fase diam disebut?",
    options: {
      a: "Destilasi",
      b: "Kromatografi",
      c: "Filtrasi",
      d: "Sentrifugasi",
      e: "Kristalisasi",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 82,
    question:
      "Manakah dari obat berikut yang merupakan diuretik kuat (Loop Diuretic)?",
    options: {
      a: "Hidroklortiazid",
      b: "Furosemid",
      c: "Spironolakton",
      d: "Manitol",
      e: "Asetazolamid",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 83,
    question: "Nilai normal tekanan darah untuk dewasa menurut JNC 8 adalah?",
    options: {
      a: "< 140/90 mmHg",
      b: "< 120/80 mmHg",
      c: "< 130/80 mmHg",
      d: "< 150/90 mmHg",
      e: "< 110/70 mmHg",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 84,
    question:
      "Obat manakah yang dikontraindikasikan untuk ibu hamil karena dapat menyebabkan kecacatan janin (teratogenik)?",
    options: {
      a: "Parasetamol",
      b: "Warfarin",
      c: "Amoksisilin",
      d: "Metildopa",
      e: "Nistatin",
    },
    correctAnswer: "b",
    category: "Apoteker Ibu dan Bayi",
  },
  {
    id: 85,
    question:
      "Penggunaan glukokortikoid (steroid) jangka panjang tanpa pengawasan dapat menyebabkan efek samping berupa?",
    options: {
      a: "Gagal jantung",
      b: "Moon Face & Osteoporosis",
      c: "Diare kronis",
      d: "Penebalan rambut",
      e: "Penurunan gula darah",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 86,
    question:
      "Dalam pelaporan narkotika dan psikotropika (SIPNAP), pelaporan dilakukan setiap?",
    options: {
      a: "Minggu sekali",
      b: "Bulan sekali (maksimal tanggal 10)",
      c: "Tiga bulan sekali",
      d: "Enam bulan sekali",
      e: "Setahun sekali",
    },
    correctAnswer: "b",
    category: "Regulasi & Etika",
  },
  {
    id: 87,
    question: "Berapa suhu penyimpanan 'dingin' menurut Farmakope Indonesia?",
    options: {
      a: "< 2 derajat C",
      b: "2 sampai 8 derajat C",
      c: "8 sampai 15 derajat C",
      d: "15 sampai 30 derajat C",
      e: "-20 derajat C",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 88,
    question:
      "Obat manakah yang termasuk dalam golongan inhibitor SGLT2 untuk pengobatan DM tipe 2?",
    options: {
      a: "Gliklazid",
      b: "Empagliflozin",
      c: "Sitagliptin",
      d: "Pioglitazon",
      e: "Akarbosa",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 89,
    question:
      "Enzim yang dihambat oleh antibiotik golongan Beta-laktam untuk merusak dinding sel bakteri adalah?",
    options: {
      a: "DNA Girase",
      b: "Transpeptidase (PBP)",
      c: "RNA Polimerase",
      d: "Dihidrofolat reduktase",
      e: "Katalase",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 90,
    question: "Penyimpanan tablet Suppositoria yang paling tepat adalah?",
    options: {
      a: "Di suhu ruangan terbuka",
      b: "Di lemari es (suhu 2-8 C)",
      c: "Di dalam freezer",
      d: "Di tempat yang terpapar sinar matahari",
      e: "Di kotak P3K dinding",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 91,
    question:
      "Obat manakah yang bekerja dengan mengencerkan dahak sehingga lebih mudah dikeluarkan (Mukolitik)?",
    options: {
      a: "Dekstrometorfan",
      b: "Asetilsistein",
      c: "Guaifenesin",
      d: "Difenhidramin",
      e: "Pseudoefedrin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 92,
    question:
      "Laporan insiden keselamatan pasien yang dikirim ke Komite Nasional Keselamatan Pasien harus dilakukan paling lambat?",
    options: {
      a: "12 jam setelah kejadian",
      b: "2 x 24 jam setelah kejadian",
      c: "1 minggu setelah kejadian",
      d: "1 bulan setelah kejadian",
      e: "Segera saat itu juga",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 93,
    question:
      "Ciri khas dari keracunan Sianida adalah bau pernapasan yang tercium seperti?",
    options: {
      a: "Bawang putih",
      b: "Kacang Almond pahit",
      c: "Telur busuk",
      d: "Buah-buahan",
      e: "Alkohol",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 94,
    question: "Interaksi antara Amiodaron dan Digoksin dapat menyebabkan?",
    options: {
      a: "Kadar digoksin menurun",
      b: "Kadar digoksin meningkat (risiko toksisitas)",
      c: "Amiodaron tidak bekerja",
      d: "Terjadi diare",
      e: "Meningkatkan nafsu makan",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 95,
    question: "Simplisia dari rimpang jahe memiliki nama latin?",
    options: {
      a: "Curcumae domesticae Rhizoma",
      b: "Zingiberis Rhizoma",
      c: "Languatis Rhizoma",
      d: "Kaempferiae Rhizoma",
      e: "Santalum album",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 96,
    question:
      "Dalam uji disolusi terbanding (UDT), pH dapar yang biasanya digunakan untuk simulasi kondisi usus adalah?",
    options: {
      a: "pH 1,2",
      b: "pH 6,8",
      c: "pH 4,5",
      d: "pH 7,4",
      e: "pH 9,0",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 7,
    question:
      "Berapa miligram kandungan zat aktif dalam 1 ampul Epinefrin 1:1000 dengan volume 1 ml?",
    options: {
      a: "0,1 mg",
      b: "1 mg",
      c: "10 mg",
      d: "100 mg",
      e: "0,01 mg",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 98,
    question:
      "Tujuan dari salut enterik pada tablet adalah agar obat pecah di?",
    options: {
      a: "Lambung",
      b: "Usus Halus",
      c: "Mulut",
      d: "Kerongkongan",
      e: "Hati",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 99,
    question:
      "Obat manakah yang termasuk golongan antidepresan SSRI (Selective Serotonin Reuptake Inhibitor)?",
    options: {
      a: "Amitriptilin",
      b: "Fluoksetin",
      c: "Diazepam",
      d: "Haloperidol",
      e: "Litium",
    },
    correctAnswer: "b",
    category: "Apoteker Jiwa",
  },
  {
    id: 100,
    question:
      "Seorang pasien mendapatkan resep 'S. dd. gtt. II. ADS'. Di mana obat tersebut harus diberikan?",
    options: {
      a: "Dua tetes pada telinga kanan",
      b: "Dua tetes pada telinga kanan dan kiri",
      c: "Dua tetes pada mata kanan",
      d: "Dua tetes pada mata kiri",
      e: "Dua tetes pada kedua mata",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 101,
    question:
      "Seorang Apoteker di RS menghitung dosis Gentamisin untuk pasien neonatus. Gentamisin dieliminasi melalui ginjal. Apa parameter farmakokinetik yang paling dipengaruhi oleh fungsi ginjal?",
    options: {
      a: "Volume Distribusi (Vd)",
      b: "Klirens (Cl)",
      c: "Bioavailabilitas (F)",
      d: "Laju Absorpsi (Ka)",
      e: "Ikatan Protein Plasma",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 102,
    question:
      "Metode pemisahan campuran yang didasarkan pada perbedaan titik didih antar komponen disebut?",
    options: {
      a: "Filtrasi",
      b: "Destilasi",
      c: "Sublimasi",
      d: "Ekstraksi",
      e: "Kristalisasi",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 103,
    question:
      "Seorang pasien wanita mengeluh keputihan karena jamur Candida albicans. Obat manakah yang merupakan pilihan utama dalam bentuk ovula?",
    options: {
      a: "Metronidazol",
      b: "Nistatin",
      c: "Amoksisilin",
      d: "Asetilsistein",
      e: "Siprofloksasin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 104,
    question:
      "Berapakah nilai perbandingan suhu dalam derajat Fahrenheit (F) terhadap Celcius (C) setelah dikurangi konstanta 32?",
    options: {
      a: "5:4",
      b: "9:5",
      c: "4:5",
      d: "5:9",
      e: "1:1",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 105,
    question:
      "Uji disolusi tahap 1 (S1) dinyatakan memenuhi syarat jika tiap unit sediaan tidak kurang dari?",
    options: {
      a: "Q + 5%",
      b: "Q + 10%",
      c: "Q - 5%",
      d: "Q - 15%",
      e: "Q + 0%",
    },
    correctAnswer: "a",
    category: "Teknologi Farmasi",
  },
  {
    id: 106,
    question: "Obat manakah yang termasuk dalam golongan Biguanida?",
    options: {
      a: "Glibenklamid",
      b: "Metformin",
      c: "Pioglitazon",
      d: "Akarbosa",
      e: "Repaglinid",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 107,
    question:
      "Pasien datang membawa resep racikan salep 20 gram yang mengandung Asam Salisilat 2%. Berapa mg jumlah asam salisilat yang dibutuhkan?",
    options: {
      a: "40 mg",
      b: "400 mg",
      c: "4 mg",
      d: "200 mg",
      e: "100 mg",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 108,
    question:
      "Penyebab utama terjadinya resistensi antibiotik pada masyarakat adalah?",
    options: {
      a: "Dosis yang terlalu tinggi",
      b: "Penggunaan antibiotik yang tidak tuntas (under-dose)",
      c: "Penggunaan antibiotik bersama vitamin",
      d: "Penyimpanan antibiotik di lemari es",
      e: "Alergi obat",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 109,
    question:
      "Obat manakah yang bekerja dengan cara menghambat enzim siklooksigenase-2 (COX-2) secara selektif?",
    options: {
      a: "Ibuprofen",
      b: "Celecoxib",
      c: "Asam Mefenamat",
      d: "Aspirin",
      e: "Ketorolak",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 110,
    question:
      "Regulasi mengenai Pekerjaan Kefarmasian di Indonesia saat ini diatur secara utama dalam?",
    options: {
      a: "PP No. 51 Tahun 2009",
      b: "UU No. 36 Tahun 2009",
      c: "Permenkes No. 73 Tahun 2016",
      d: "Permenkes No. 9 Tahun 2017",
      e: "UU No. 17 Tahun 2023",
    },
    correctAnswer: "e",
    category: "Regulasi & Etika",
  },
  {
    id: 111,
    question:
      "Untuk meningkatkan kelarutan suatu zat dalam air, sering ditambahkan surfaktan. Konsentrasi surfaktan di mana mulai terbentuk misel disebut?",
    options: {
      a: "HLB",
      b: "Critical Micelle Concentration (CMC)",
      c: "Titik Kabut",
      d: "Kelarutan Jenuh",
      e: "Potensial Zeta",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 112,
    question:
      "Obat asma yang bekerja dengan cara menstabilkan membran sel mast sehingga mencegah pelepasan mediator inflamasi adalah?",
    options: {
      a: "Salbutamol",
      b: "Natrium Kromolin",
      c: "Teofilin",
      d: "Ipratropium",
      e: "Prednison",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 113,
    question: "Ciri khas dari sediaan emulsi yang mengalami 'Creaming' adalah?",
    options: {
      a: "Pemisahan fase yang tidak bisa menyatu kembali",
      b: "Terbentuknya lapisan di permukaan yang bisa didispersikan kembali",
      c: "Perubahan warna sediaan",
      d: "Pertumbuhan mikroba di permukaan",
      e: "Terbentuknya gas dalam wadah",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 114,
    question:
      "Berapa gram NaCl yang harus ditambahkan pada 100 ml air agar didapatkan larutan isotonis (0,9%)?",
    options: {
      a: "0,09 gram",
      b: "0,9 gram",
      c: "9 gram",
      d: "90 gram",
      e: "0,1 gram",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 115,
    question:
      "Antibiotik golongan Makrolida yang sering digunakan sebagai alternatif bagi pasien yang alergi Penisilin adalah?",
    options: {
      a: "Sefadroksil",
      b: "Eritromisin",
      c: "Gentamisin",
      d: "Tetrasiklin",
      e: "Siprofloksasin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 116,
    question:
      "Pemeriksaan fungsi hati secara laboratorium umumnya memantau kadar enzim?",
    options: {
      a: "BUN dan Kreatinin",
      b: "SGOT dan SGPT",
      c: "LDL dan HDL",
      d: "GDS dan GDP",
      e: "Asam Urat",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 117,
    question:
      "Sediaan farmasi yang dibuat dengan cara mengekstraksi simplisia nabati dengan air pada suhu 90 derajat selama 15 menit disebut?",
    options: {
      a: "Dekokta",
      b: "Infusa",
      c: "Maserat",
      d: "Ekstrak",
      e: "Sirup",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 118,
    question: "Interaksi antara Digoksin dan Spironolakton dapat menyebabkan?",
    options: {
      a: "Hipokalemia yang meningkatkan risiko toksisitas digoksin",
      b: "Hiperkalemia yang dapat menurunkan efek digoksin atau memicu aritmia",
      c: "Hipotensi berat",
      d: "Kerusakan pendengaran",
      e: "Gangguan penglihatan",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 119,
    question:
      "Wadah yang tertutup rapat sesuai Farmakope Indonesia adalah wadah yang?",
    options: {
      a: "Dapat mencegah tembusnya udara",
      b: "Melindungi isi terhadap masuknya bahan cair, padat atau uap selama penanganan",
      c: "Hanya melindungi dari debu",
      d: "Tahan terhadap tekanan tinggi",
      e: "Tidak dapat dibuka kembali",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 120,
    question:
      "Obat manakah yang digunakan untuk mengatasi efek samping ekstrapiramidal akibat penggunaan antipsikotik tipikal?",
    options: {
      a: "Haloperidol",
      b: "Triheksifenidil",
      c: "Klozapin",
      d: "Amitriptilin",
      e: "Diazepam",
    },
    correctAnswer: "b",
    category: "Apoteker Jiwa",
  },
  {
    id: 121,
    question:
      "Salah satu metode sterilisasi gas yang paling umum untuk alat kesehatan plastik yang tidak tahan panas adalah menggunakan?",
    options: {
      a: "Klorin",
      b: "Etilen Oksida",
      c: "Karbon Dioksida",
      d: "Oksigen",
      e: "Nitrogen",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 122,
    question:
      "Berapa ml sirup yang dibutuhkan jika resep meminta 120 ml Linctus, dan tiap 5 ml mengandung 10 mg kodein, sedangkan sediaan yang tersedia 20 mg/5 ml?",
    options: {
      a: "30 ml",
      b: "60 ml",
      c: "120 ml",
      d: "15 ml",
      e: "10 ml",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 123,
    question: "Vaksin MMR diberikan untuk mencegah penyakit?",
    options: {
      a: "Meningitis, Mumps, Rubella",
      b: "Measles (Campak), Mumps (Gondongan), Rubella",
      c: "Measles, Malaria, Rabies",
      d: "Mumps, Meningitis, Rabies",
      e: "Meningitis, Malaria, Rubella",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 124,
    question: "Pemberian dosis muatan (loading dose) bertujuan untuk?",
    options: {
      a: "Mengurangi efek samping",
      b: "Mencapai kadar tunak (steady state) dalam darah dengan lebih cepat",
      c: "Memperpanjang waktu paruh obat",
      d: "Mencegah metabolisme di hati",
      e: "Meningkatkan ekskresi obat",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 125,
    question:
      "Pemeriksaan fungsi ginjal laboratorium memantau parameter GFR. Apa kepanjangan dari GFR?",
    options: {
      a: "Glucose Filtration Rate",
      b: "Glomerular Filtration Rate",
      c: "Gastro Filtration Rate",
      d: "Glomerular Fluid Ratio",
      e: "Genetic Factor Rate",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 126,
    question:
      "Zat tambahan yang digunakan untuk menjaga stabilitas sediaan dari oksidasi adalah?",
    options: {
      a: "Pengawet (Preservative)",
      b: "Antioksidan",
      c: "Buffer",
      d: "Pemanis",
      e: "Pewarna",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 127,
    question:
      "Obat manakah yang bekerja dengan menghambat enzim dihidrofolat reduktase?",
    options: {
      a: "Penisilin",
      b: "Metotreksat",
      c: "Siprofloksasin",
      d: "Gentamisin",
      e: "Eritromisin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 128,
    question: "Warna label untuk obat 'Bebas Terbatas' di Indonesia adalah?",
    options: {
      a: "Lingkaran Hijau garis tepi hitam",
      b: "Lingkaran Biru garis tepi hitam",
      c: "Lingkaran Merah dengan huruf K",
      d: "Palang Medali Merah",
      e: "Lingkaran Kuning",
    },
    correctAnswer: "b",
    category: "Regulasi & Etika",
  },
  {
    id: 129,
    question: "Istilah 'Pharmacovigilance' berkaitan dengan kegiatan?",
    options: {
      a: "Pemantauan harga obat",
      b: "Pemantauan keamanan obat sesudah dipasarkan (MESO)",
      c: "Uji klinis fase 1",
      d: "Promosi obat ke dokter",
      e: "Penyusunan formularium",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 130,
    question:
      "Interaksi antara levodopa dan vitamin B6 (piridoksin) menyebabkan?",
    options: {
      a: "Efek levodopa meningkat",
      b: "Metabolisme levodopa di perifer meningkat sehingga efek di otak berkurang",
      c: "Kerusakan hati",
      d: "Meningkatkan absorbsi levodopa",
      e: "Tidak ada interaksi",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 131,
    question:
      "Alat yang digunakan untuk mengukur viskositas suatu cairan adalah?",
    options: {
      a: "Spektrofotometer",
      b: "Viskometer (misal: Brookfield)",
      c: "Piknometer",
      d: "Termometer",
      e: "Hardness Tester",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 132,
    question:
      "Obat manakah yang merupakan pilihan utama untuk mengatasi serangan kejang akut (status epileptikus)?",
    options: {
      a: "Fenitoin",
      b: "Diazepam (Intravena/Rektal)",
      c: "Asam Valproat",
      d: "Karbamazepin",
      e: "Etosuksimid",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 133,
    question:
      "Sediaan suspensi yang memiliki sifat partikel mengendap perlahan tetapi sulit didispersikan kembali disebut sistem?",
    options: {
      a: "Flokulasi",
      b: "Deflokulasi",
      c: "Koagulasi",
      d: "Kriming",
      e: "Caking",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 134,
    question: "Fungsi dari dapar (buffer) dalam sediaan mata adalah untuk?",
    options: {
      a: "Menjaga kejernihan",
      b: "Menjaga pH agar sesuai dengan pH air mata (kenyamanan)",
      c: "Meningkatkan viskositas",
      d: "Membunuh bakteri",
      e: "Menambah rasa manis",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 135,
    question:
      "Berapa ml alkohol 70% yang dapat dibuat dari 100 ml alkohol 95%?",
    options: {
      a: "125,7 ml",
      b: "135,7 ml",
      c: "70 ml",
      d: "150 ml",
      e: "110 ml",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 136,
    question:
      "Bentuk sediaan obat yang paling cepat diabsorpsi melalui rute per oral adalah?",
    options: {
      a: "Tablet",
      b: "Larutan (Solusio)",
      c: "Suspensi",
      d: "Kapsul",
      e: "Tablet salut selaput",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 137,
    question:
      "Penyebab penyakit malaria adalah parasit yang dibawa oleh nyamuk Anopheles, yaitu?",
    options: {
      a: "Salmonella typhi",
      b: "Plasmodium sp.",
      c: "Mycobacterium",
      d: "Vibrio cholerae",
      e: "Entamoeba",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 138,
    question: "Obat manakah yang merupakan antidotum untuk keracunan zat besi?",
    options: {
      a: "Penisilamin",
      b: "Deferoksamin",
      c: "Edetat",
      d: "Dimercaprol",
      e: "Kalsium",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 139,
    question:
      "Dalam resep tertulis 'S. t. dd. caps. I'. Apa arti dari instruksi tersebut?",
    options: {
      a: "Satu kali sehari satu kapsul",
      b: "Tiga kali sehari satu kapsul",
      c: "Dua kali sehari satu kapsul",
      d: "Tiga kali sehari dua kapsul",
      e: "Tiap tiga jam satu kapsul",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 140,
    question:
      "Obat anti-hipertensi golongan ARB (Angiotensin Receptor Blocker) bekerja dengan menghambat?",
    options: {
      a: "Pembentukan Angiotensin II",
      b: "Reseptor Angiotensin II (AT1)",
      c: "Enzim Renin",
      d: "Kanal Kalsium",
      e: "Reseptor Beta",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 141,
    question:
      "Indikator yang menunjukkan kemampuan suatu metode analisis untuk memberikan hasil yang sama pada pengujian berulang disebut?",
    options: {
      a: "Akurasi",
      b: "Presisi",
      c: "Spesifisitas",
      d: "Linearitas",
      e: "Robustness",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 142,
    question:
      "Seorang pasien asma menggunakan Aminofilin. Rentang terapi sempit obat ini memerlukan pemantauan (TDM). Apa gejala toksisitas yang sering muncul?",
    options: {
      a: "Mengantuk berat",
      b: "Takikardia dan tremor",
      c: "Konstipasi",
      d: "Hipotensi",
      e: "Retensi urin",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 143,
    question:
      "Berapa lama waktu penyimpanan sediaan Tetes Mata dosis ganda setelah segel dibuka (BUD)?",
    options: {
      a: "14 Hari",
      b: "28-30 Hari",
      c: "3 Bulan",
      d: "6 Bulan",
      e: "Sampai tanggal kadaluarsa di kemasan",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 144,
    question:
      "Salah satu syarat air untuk injeksi (Water for Injection) adalah?",
    options: {
      a: "Boleh mengandung mineral tinggi",
      b: "Harus bebas pirogen",
      c: "Tidak perlu steril",
      d: "Boleh berwarna keruh",
      e: "pH harus basa",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 145,
    question:
      "Obat anti-kolesterol golongan fibrat (seperti Fenofibrat) lebih spesifik ditujukan untuk menurunkan?",
    options: {
      a: "LDL",
      b: "Trigliserida",
      c: "HDL",
      d: "Asam Urat",
      e: "Gula Darah",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 146,
    question:
      "Manakah dari berikut ini yang merupakan contoh pengikat (binder) alami dalam pembuatan tablet?",
    options: {
      a: "Magnesium Stearat",
      b: "Mucilago Amili (Pati)",
      c: "Talk",
      d: "Laktosa",
      e: "Avicel",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 147,
    question:
      "Sebuah apotek memiliki persediaan awal 50 juta, pembelian 150 juta, dan persediaan akhir 40 juta. Berapa Harga Pokok Penjualan (HPP)-nya?",
    options: {
      a: "140 juta",
      b: "160 juta",
      c: "200 juta",
      d: "240 juta",
      e: "100 juta",
    },
    correctAnswer: "b",
    category: "Manajemen Farmasi",
  },
  {
    id: 148,
    question:
      "Obat cacing (Antelmintik) yang bekerja dengan cara melumpuhkan cacing adalah?",
    options: {
      a: "Amoksisilin",
      b: "Pirantel Pamoat",
      c: "Metronidazol",
      d: "Nistatin",
      e: "Kotrimoksazol",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 149,
    question: "Istilah 'Pharmacoeconomics' mempelajari tentang?",
    options: {
      a: "Cara membuat obat murah",
      b: "Analisis biaya dan hasil dari terapi obat",
      c: "Cara menjual obat di apotek",
      d: "Pajak perusahaan farmasi",
      e: "Gaji apoteker",
    },
    correctAnswer: "b",
    category: "Manajemen Farmasi",
  },
  {
    id: 150,
    question:
      "Sediaan transdermal patch (seperti koyo nikotin) memberikan efek obat secara?",
    options: {
      a: "Lokal di kulit saja",
      b: "Sistemik melalui penyerapan kulit ke pembuluh darah",
      c: "Hanya mendinginkan kulit",
      d: "Melalui saluran pencernaan",
      e: "Melalui pernapasan",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 151,
    question:
      "Obat antiretroviral (ARV) yang bekerja dengan cara menghambat enzim integrase adalah?",
    options: {
      a: "Zidovudin",
      b: "Dolutegravir",
      c: "Nevirapin",
      d: "Efavirenz",
      e: "Tenofovir",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 152,
    question:
      "Efek samping 'Moon Face' dan 'Buffalo Hump' adalah ciri khas penggunaan jangka panjang obat golongan?",
    options: {
      a: "NSAID",
      b: "Kortikosteroid",
      c: "Antibiotik",
      d: "Antihistamin",
      e: "Diuretik",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 153,
    question:
      "Dalam pembuatan tablet, penambahan bahan 'disintegran' bertujuan untuk?",
    options: {
      a: "Mempercepat waktu hancur tablet di dalam cairan tubuh",
      b: "Meningkatkan kekerasan tablet",
      c: "Memudahkan tablet saat dicetak",
      d: "Menutupi rasa pahit obat",
      e: "Menambah berat tablet",
    },
    correctAnswer: "a",
    category: "Teknologi Farmasi",
  },
  {
    id: 154,
    question:
      "Seorang pasien geriatri mengalami konstipasi akibat penggunaan obat nyeri kronis. Obat nyeri manakah yang paling sering menyebabkan konstipasi?",
    options: {
      a: "Ibuprofen",
      b: "Kodein (Opioid)",
      c: "Parasetamol",
      d: "Celecoxib",
      e: "Asam Mefenamat",
    },
    correctAnswer: "b",
    category: "Apoteker Medical Bedah",
  },
  {
    id: 155,
    question:
      "Sediaan parenteral yang diberikan melalui penyuntikan langsung ke dalam cairan serebrospinal disebut rute?",
    options: {
      a: "Intravena",
      b: "Intratekal",
      c: "Intramuskular",
      d: "Subkutan",
      e: "Intraarterial",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 156,
    question:
      "Parameter 'Clearance' (Klirens) dalam farmakokinetika didefinisikan sebagai?",
    options: {
      a: "Volume darah yang dibersihkan dari obat per satuan waktu",
      b: "Waktu yang dibutuhkan agar kadar obat menjadi setengahnya",
      c: "Jumlah obat yang mencapai sirkulasi sistemik",
      d: "Kecepatan obat masuk ke dalam jaringan",
      e: "Total obat yang dikeluarkan melalui urin",
    },
    correctAnswer: "a",
    category: "Farmakologi Klinis",
  },
  {
    id: 157,
    question:
      "Vaksin yang harus disimpan pada suhu beku (-15°C hingga -25°C) karena sangat tidak stabil adalah?",
    options: {
      a: "Hepatitis B",
      b: "OPV (Oral Polio Vaccine)",
      c: "TT (Tetanus Toxoid)",
      d: "DT",
      e: "BCG",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 158,
    question:
      "Seorang pasien keracunan metanol. Antidotum yang dapat diberikan untuk menghambat metabolisme metanol menjadi asam format adalah?",
    options: {
      a: "Atropin",
      b: "Etanol atau Fomepizole",
      c: "Nalokson",
      d: "Asetilsistein",
      e: "Natrium Thiosulfat",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 159,
    question:
      "Metode pembersihan alat di industri farmasi yang dilakukan untuk mencegah kontaminasi silang disebut?",
    options: {
      a: "Validasi Metode Analisis",
      b: "Validasi Pembersihan (Cleaning Validation)",
      c: "Kualifikasi Alat",
      d: "Kalibrasi",
      e: "Sanitasi",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 160,
    question:
      "Obat manakah yang termasuk golongan pengikat fosfat (phosphate binder) untuk pasien gagal ginjal kronis?",
    options: {
      a: "Kalsium Karbonat",
      b: "Furosemid",
      c: "Lisinopril",
      d: "Eritropoetin",
      e: "Kalsitriol",
    },
    correctAnswer: "a",
    category: "Farmakologi Klinis",
  },
  {
    id: 161,
    question:
      "Manakah dari berikut ini yang merupakan indikasi utama penggunaan Amiodaron?",
    options: {
      a: "Hipertensi",
      b: "Aritmia jantung",
      c: "Gagal ginjal",
      d: "Infeksi bakteri",
      e: "Diabetes",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 162,
    question:
      "Uji sterilitas sediaan farmasi menurut Farmakope menggunakan media?",
    options: {
      a: "Agar Darah",
      b: "Fluid Thioglycollate Medium (FTM)",
      c: "MacConkey Agar",
      d: "Nutrient Agar",
      e: "Silika Gel",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 163,
    question:
      "Pasien dengan riwayat asma dilarang menggunakan obat hipertensi golongan beta-blocker non-selektif seperti Propranolol karena risiko?",
    options: {
      a: "Takikardia",
      b: "Bronkospasme (Penyempitan saluran napas)",
      c: "Hiperglikemia",
      d: "Retensi urin",
      e: "Konstipasi",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 164,
    question:
      "Berapa jumlah 'Buffer Stock' yang harus tersedia jika rata-rata pemakaian obat 100 tablet/bulan dan lead time (waktu tunggu) adalah 0,5 bulan?",
    options: {
      a: "200 tablet",
      b: "50 tablet",
      c: "100 tablet",
      d: "25 tablet",
      e: "10 tablet",
    },
    correctAnswer: "b",
    category: "Manajemen Farmasi",
  },
  {
    id: 165,
    question:
      "Obat sitostatika (kanker) yang memiliki efek samping khas berupa toksisitas jantung (kardiotoksisitas) adalah?",
    options: {
      a: "Siklofosfamid",
      b: "Doxorubicin",
      c: "Vinkristin",
      d: "Metotreksat",
      e: "Sisplatin",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 166,
    question:
      "Teknik kromatografi yang menggunakan gas sebagai fase gerak disebut?",
    options: {
      a: "HPLC",
      b: "GC (Gas Chromatography)",
      c: "TLC",
      d: "Kertas",
      e: "Kolom",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 167,
    question:
      "Berapa ml insulin yang diambil dari vial 100 IU/ml jika dosis yang diminta adalah 20 IU?",
    options: {
      a: "0,1 ml",
      b: "0,2 ml",
      c: "0,5 ml",
      d: "2 ml",
      e: "1 ml",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 168,
    question:
      "Larutan yang memiliki tekanan osmotik lebih rendah daripada cairan tubuh disebut?",
    options: {
      a: "Isotonis",
      b: "Hipotonis",
      c: "Hipertonis",
      d: "Isohidris",
      e: "Isotermal",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 169,
    question:
      "Obat manakah yang bekerja dengan menghambat enzim PDE-5 untuk terapi disfungsi ereksi?",
    options: {
      a: "Tamsulosin",
      b: "Sildenafil",
      c: "Finasterid",
      d: "Dutasterid",
      e: "Alprostadil",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 170,
    question: "Berapakah pH lambung manusia dalam keadaan normal/kosong?",
    options: {
      a: "pH 7",
      b: "pH 1 - 3",
      c: "pH 5 - 6",
      d: "pH 8 - 9",
      e: "pH 4 - 5",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 171,
    question:
      "Bentuk sediaan inhalasi yang menggunakan serbuk kering dan diaktifkan oleh hirupan pasien disebut?",
    options: {
      a: "MDI",
      b: "DPI (Dry Powder Inhaler)",
      c: "Nebulizer",
      d: "Spacer",
      e: "Vaporizer",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 172,
    question:
      "Dalam pengujian mutu tablet, uji 'Friabilitas' (Kerapuhan) dianggap memenuhi syarat jika kehilangan bobot tidak lebih dari?",
    options: {
      a: "0,1%",
      b: "1,0%",
      c: "5,0%",
      d: "10%",
      e: "0,5%",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 173,
    question:
      "Antivirus oseltamivir paling efektif diberikan pada pasien flu jika dimulai dalam jangka waktu?",
    options: {
      a: "12 jam pertama",
      b: "48 jam pertama sejak gejala muncul",
      c: "7 hari setelah gejala",
      d: "Kapan saja",
      e: "Hanya jika demam di atas 40°C",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 174,
    question: "Istilah 'Pharmacogenomics' mempelajari hubungan antara?",
    options: {
      a: "Obat dan harga",
      b: "Variasi genetik dan respon terhadap obat",
      c: "Obat dan bakteri",
      d: "Obat dan makanan",
      e: "Dosis dan berat badan",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 175,
    question:
      "Zat yang ditambahkan dalam sediaan eliksir untuk meningkatkan kelarutan zat aktif disebut?",
    options: {
      a: "Pemanis",
      b: "Cosolvent (Pelarut campur)",
      c: "Pengawet",
      d: "Pewarna",
      e: "Penyalut",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 176,
    question:
      "Obat diabetes 'Akarbosa' bekerja di saluran pencernaan dengan cara?",
    options: {
      a: "Meningkatkan sekresi insulin",
      b: "Menghambat enzim alfa-glukosidase (menunda absorpsi glukosa)",
      c: "Menurunkan berat badan",
      d: "Meningkatkan sensitivitas insulin",
      e: "Menghambat glukoneogenesis",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 177,
    question:
      "Simplisia 'Digitalis folium' mengandung glikosida jantung yang berfungsi meningkatkan kontraksi otot jantung, yaitu?",
    options: {
      a: "Atropin",
      b: "Digoksin",
      c: "Kinin",
      d: "Reserpin",
      e: "Morfin",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 178,
    question:
      "Area di industri farmasi untuk proses pengisian (filling) sediaan steril secara aseptis masuk dalam kategori?",
    options: {
      a: "Kelas A",
      b: "Kelas B",
      c: "Kelas C",
      d: "Kelas D",
      e: "Kelas E",
    },
    correctAnswer: "a",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 179,
    question:
      "Obat manakah yang memiliki efek samping berupa pewarnaan oranye pada urin, keringat, dan air mata?",
    options: {
      a: "Isoniazid",
      b: "Rifampisin",
      c: "Pirazinamid",
      d: "Etambutol",
      e: "Streptomisin",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 180,
    question:
      "Kandungan aktif utama dalam rimpang kunyit (Curcuma domestica) yang berfungsi sebagai hepatoprotektor adalah?",
    options: {
      a: "Xanthorrhizol",
      b: "Kurkuminoid",
      c: "Gingerol",
      d: "Alisin",
      e: "Papain",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 181,
    question:
      "Metode pemberian nutrisi langsung melalui pembuluh darah vena pada pasien yang tidak bisa makan secara oral disebut?",
    options: {
      a: "Enteral",
      b: "Parenteral (TPN - Total Parenteral Nutrition)",
      c: "Sublingual",
      d: "Rektal",
      e: "Topikal",
    },
    correctAnswer: "b",
    category: "Apoteker Medical Bedah",
  },
  {
    id: 182,
    question:
      "Berapa ml larutan stok 10% yang dibutuhkan untuk membuat 500 ml larutan 2%?",
    options: {
      a: "50 ml",
      b: "100 ml",
      c: "200 ml",
      d: "25 ml",
      e: "150 ml",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 183,
    question:
      "Obat manakah yang digunakan untuk mengatasi depresi dengan cara menghambat enzim MAO?",
    options: {
      a: "Sertralin",
      b: "Fenelzin",
      c: "Amitriptilin",
      d: "Fluoksetin",
      e: "Venlafaksin",
    },
    correctAnswer: "b",
    category: "Apoteker Jiwa",
  },
  {
    id: 184,
    question: "Berapa ml volume 1 sendok makan (Cochlear/C) menurut standar?",
    options: {
      a: "5 ml",
      b: "15 ml",
      c: "10 ml",
      d: "20 ml",
      e: "2,5 ml",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 185,
    question:
      "Obat manakah yang bekerja sebagai agen pengkelat (chelating agent) untuk keracunan logam berat timbal?",
    options: {
      a: "Nalokson",
      b: "Ca-EDTA",
      c: "Flumazenil",
      d: "Atropin",
      e: "Etanol",
    },
    correctAnswer: "b",
    category: "Kesehatan Masyarakat",
  },
  {
    id: 186,
    question: "Dalam CPOB, singkatan dari DQ adalah?",
    options: {
      a: "Data Quality",
      b: "Design Qualification (Kualifikasi Desain)",
      c: "Delivery Quantity",
      d: "Digital Quality",
      e: "Distribution Qualification",
    },
    correctAnswer: "b",
    category: "Teknologi Farmasi",
  },
  {
    id: 187,
    question:
      "Obat manakah yang termasuk dalam golongan inhibitor sistem saraf pusat dan sering digunakan sebagai premedikasi anestesi?",
    options: {
      a: "Amfetamin",
      b: "Midazolam",
      c: "Kafein",
      d: "Salbutamol",
      e: "Epinefrin",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 188,
    question:
      "Parameter yang menggambarkan jumlah obat yang tersedia dalam darah setelah pemberian dibanding rute intravena disebut?",
    options: {
      a: "Volume Distribusi",
      b: "Bioavailabilitas Absolut",
      c: "Waktu Paruh",
      d: "Klirens",
      e: "Kandungan Zat",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 189,
    question:
      "Penggunaan Tetrasiklin pada wanita hamil dikontraindikasikan karena dapat menyebabkan?",
    options: {
      a: "Gagal jantung janin",
      b: "Diskolorisasi gigi dan hambatan pertumbuhan tulang janin",
      c: "Buta warna",
      d: "Diabetes gestasional",
      e: "Obesitas",
    },
    correctAnswer: "b",
    category: "Apoteker Ibu dan Bayi",
  },
  {
    id: 190,
    question:
      "Larutan pencuci mata sering mengandung asam borat. Apa fungsi utama asam borat tersebut?",
    options: {
      a: "Pemberi warna",
      b: "Pengatur pH (Dapar) dan antiseptik lemah",
      c: "Meningkatkan viskositas",
      d: "Sebagai pemanis",
      e: "Sebagai anestesi lokal",
    },
    correctAnswer: "b",
    category: "Teknologi Sediaan Steril",
  },
  {
    id: 191,
    question:
      "Interaksi antara alkohol dan metronidazol dapat menyebabkan reaksi yang sangat tidak nyaman (mual muntah hebat) yang disebut?",
    options: {
      a: "Reaksi Anafilaksis",
      b: "Reaksi Disulfiram-like",
      c: "Sindrom Steven-Johnson",
      d: "Toksisitas Hati",
      e: "Hipotensi",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 192,
    question:
      "Berapa nomor saringan (mesh) yang digunakan untuk mendapatkan serbuk yang sangat halus?",
    options: {
      a: "Mesh 20",
      b: "Mesh 100 atau lebih",
      c: "Mesh 40",
      d: "Mesh 10",
      e: "Mesh 5",
    },
    correctAnswer: "b",
    category: "Farmasetika",
  },
  {
    id: 193,
    question:
      "Istilah 'Laju Endap Darah' (LED) yang tinggi dalam hasil lab biasanya menunjukkan adanya?",
    options: {
      a: "Anemia",
      b: "Inflamasi atau infeksi dalam tubuh",
      c: "Diabetes",
      d: "Kurang gizi",
      e: "Gangguan fungsi ginjal",
    },
    correctAnswer: "b",
    category: "Patofisiologi",
  },
  {
    id: 194,
    question:
      "Obat manakah yang bekerja dengan menginhibisi enzim reverse transcriptase (NRTI)?",
    options: {
      a: "Ritonavir",
      b: "Abacavir",
      c: "Maraviroc",
      d: "Enfuvirtid",
      e: "Raltegravir",
    },
    correctAnswer: "b",
    category: "Farmakologi",
  },
  {
    id: 195,
    question:
      "Apa tujuan penambahan anti-oksidan seperti BHT/BHA dalam formulasi sediaan minyak?",
    options: {
      a: "Mencegah ketengikan (oksidasi lemak)",
      b: "Meningkatkan rasa",
      c: "Mengharumkan sediaan",
      d: "Memadatkan minyak",
      e: "Meningkatkan harga",
    },
    correctAnswer: "a",
    category: "Teknologi Farmasi",
  },
  {
    id: 196,
    question:
      "Dalam resep tertulis 'd.i.d' (da in dimidio). Apa maksud instruksi tersebut?",
    options: {
      a: "Berikan seluruhnya",
      b: "Berikan setengahnya",
      c: "Berikan dua kalinya",
      d: "Berikan segera",
      e: "Jangan diberikan",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 197,
    question:
      "Obat anti-hipertensi golongan diuretik yang dapat menyebabkan efek samping asam urat tinggi (hiperurisemia) adalah?",
    options: {
      a: "Spironolakton",
      b: "Hidroklortiazid (HCT)",
      c: "Manitol",
      d: "Asetazolamid",
      e: "Amilorid",
    },
    correctAnswer: "b",
    category: "Farmakologi Klinis",
  },
  {
    id: 198,
    question:
      "Berapa gram jumlah zat jika sediaan tertulis 1% b/v dalam volume 60 ml?",
    options: {
      a: "0,06 gram",
      b: "0,6 gram",
      c: "6 gram",
      d: "60 gram",
      e: "0,006 gram",
    },
    correctAnswer: "b",
    category: "Farmasetika Dasar",
  },
  {
    id: 199,
    question:
      "Proses pemisahan campuran cair berdasarkan perbedaan volatilitas dengan bantuan uap air disebut?",
    options: {
      a: "Maserasi",
      b: "Destilasi uap",
      c: "Sublimasi",
      d: "Kromatografi",
      e: "Sentrifugasi",
    },
    correctAnswer: "b",
    category: "Farmakognosi",
  },
  {
    id: 200,
    question:
      "Seorang Apoteker harus memberikan edukasi penggunaan obat tetes telinga. Setelah meneteskan obat, posisi kepala harus miring selama?",
    options: {
      a: "10 detik",
      b: "2-3 menit",
      c: "15 menit",
      d: "1 jam",
      e: "Tidak perlu miring",
    },
    correctAnswer: "b",
    category: "Asuhan Apoteker Dasar",
  },
];

// Sample test results for dashboard
export const dummyTestResults: LegacyTestResult[] = [
  {
    id: "result_1",
    userId: "apt_001",
    username: "apt001",
    score: 85,
    totalQuestions: 200,
    correctAnswers: 170,
    completedAt: new Date("2024-02-20T10:30:00"),
    duration: 7200,
  },
  {
    id: "result_2",
    userId: "apt_002",
    username: "apt002",
    score: 78,
    totalQuestions: 200,
    correctAnswers: 156,
    completedAt: new Date("2024-02-21T09:15:00"),
    duration: 7500,
  },
  {
    id: "result_3",
    userId: "apt_003",
    username: "apt003",
    score: 92,
    totalQuestions: 200,
    correctAnswers: 184,
    completedAt: new Date("2024-02-22T11:00:00"),
    duration: 6800,
  },
  {
    id: "result_4",
    userId: "apt_004",
    username: "apt004",
    score: 81,
    totalQuestions: 200,
    correctAnswers: 162,
    completedAt: new Date("2024-02-23T14:45:00"),
    duration: 7300,
  },
  {
    id: "result_5",
    userId: "apt_005",
    username: "apt005",
    score: 88,
    totalQuestions: 200,
    correctAnswers: 176,
    completedAt: new Date("2024-02-24T13:20:00"),
    duration: 7100,
  },
];

const shuffleArray = (array: any) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Initialize localStorage with dummy data
export const initializeDummyData = () => {
  if (typeof window !== "undefined") {
    // Only initialize if not already set
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(dummyUsers));
    }
    if (!localStorage.getItem("questions")) {
      const randomizedQuestions = shuffleArray(dummyQuestions);
      localStorage.setItem("questions", JSON.stringify(randomizedQuestions));
    }
    if (!localStorage.getItem("test-results")) {
      localStorage.setItem("test-results", JSON.stringify(dummyTestResults));
    }
  }
};
