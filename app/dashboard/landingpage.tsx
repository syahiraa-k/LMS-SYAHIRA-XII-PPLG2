"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>

            <span className="font-bold text-xl text-slate-900">
              CittClass
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ["Beranda", "hero"],
              ["Fitur", "fitur"],
              ["Kontak", "kontak"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-2 bg-white">
            {[
              ["Beranda", "hero"],
              ["Fitur", "fitur"],
              ["Kontak", "kontak"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        id="hero"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Platform LMS #1 untuk Sekolah Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Belajar Lebih Mudah
            <br />
            <span className="text-blue-600">Bersama CittClass.</span>
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Platform pembelajaran digital yang memudahkan siswa, guru, dan
            manajemen sekolah dalam satu ekosistem terintegrasi. Mulai belajar
            lebih efektif sekarang.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-base"
            >
              Login Sekarang →
            </button>

            <button
              onClick={() => scrollTo("fitur")}
              className="border border-slate-200 text-slate-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-slate-50 transition text-base"
            >
              Lihat Fitur
            </button>
          </div>

          <div className="mt-8 flex items-center gap-6">
            {[
              ["200+", "Siswa Aktif"],
              ["105+", "Guru"],
              ["78+", "Mata Pelajaran"],
            ].map(([num, lbl]) => (
              <div key={lbl}>
                <p className="text-xl font-bold text-slate-900">{num}</p>
                <p className="text-xs text-slate-500">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-8 relative overflow-hidden">
            {/* Floating decoration */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>

            <div className="absolute bottom-4 left-4 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Main illustration */}
            <div className="bg-white rounded-2xl shadow-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Pemrograman Web
                  </p>
                  <p className="text-xs text-slate-500">
                    Budi Santoso, S.Kom.
                  </p>
                </div>

                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress Materi</span>
                  <span className="font-semibold text-blue-600">75%</span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>
            </div>

            {/* Small Statistics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Quiz Aktif",
                  value: "3",
                  icon: "❓",
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  label: "Tugas",
                  value: "5",
                  icon: "📝",
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Materi",
                  value: "24",
                  icon: "📚",
                  color: "bg-green-50 text-green-600",
                },
                {
                  label: "Nilai",
                  value: "87",
                  icon: "⭐",
                  color: "bg-violet-50 text-violet-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.color} rounded-xl p-3`}
                >
                  <p className="text-xl">{s.icon}</p>
                  <p className="text-lg font-bold mt-1">{s.value}</p>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
              ✓
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Quiz Selesai!
              </p>
              <p className="text-xs text-slate-500">Nilai: 95/100</p>
            </div>
          </div>

          <div className="absolute -bottom-3 -right-3 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Materi Baru
              </p>
              <p className="text-xs text-slate-500">
                CSS Grid & Flexbox
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { num: "200+", label: "Siswa Aktif" },
            { num: "105+", label: "Guru Terdaftar" },
            { num: "78+", label: "Mata Pelajaran" },
            { num: "355+", label: "Materi Tersedia" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-extrabold">
                {s.num}
              </p>
              <p className="text-blue-200 text-sm mt-1 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fitur Utama */}
      <section
        id="fitur"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-20"
      >
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
            Fitur Utama
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Semua yang kamu butuhkan untuk belajar
          </h2>

          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            CittClass hadir dengan fitur lengkap untuk mendukung proses
            pembelajaran yang efektif dan menyenangkan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              ),
              color: "bg-blue-600",
              bg: "bg-blue-50",
              title: "Materi",
              desc: "Akses ribuan materi pembelajaran yang dikurasi oleh guru berpengalaman. Tersedia dalam format PDF, dokumen, dan presentasi interaktif yang mudah diunduh.",
              tags: ["PDF", "Dokumen", "Slide"],
            },
            {
              icon: (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                  />
                </svg>
              ),
              color: "bg-sky-500",
              bg: "bg-sky-50",
              title: "Video Pembelajaran",
              desc: "Tonton video pembelajaran berkualitas tinggi kapan saja dan di mana saja. Belajar dengan cara yang lebih visual dan mudah dipahami.",
              tags: ["HD Video", "Streaming", "Download"],
            },
            {
              icon: (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              color: "bg-green-500",
              bg: "bg-green-50",
              title: "Quiz dan Latihan",
              desc: "Uji pemahaman dengan quiz interaktif dan latihan soal yang dibuat langsung oleh guru. Dapatkan feedback instan dan pantau perkembangan belajarmu.",
              tags: ["Multiple Choice", "Auto-graded", "Feedback"],
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className={`w-14 h-14 ${f.bg} ${f.color.replace(
                  "bg-",
                  "text-"
                )} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                {f.icon}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {f.title}
              </h3>

              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                {f.desc}
              </p>

              <div className="flex gap-2 flex-wrap">
                {f.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Cara Kerja
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Belajar dalam 3 Langkah
            </h2>

            <p className="text-slate-500 text-lg">
              Mulai perjalanan belajarmu dengan CittClass sangat mudah dan
              cepat.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-blue-300" />

            {[
              {
                step: "01",
                title: "Login",
                desc: "Masuk ke platform CittClass menggunakan akun yang telah diberikan oleh sekolah atau administrator.",
                icon: "🔐",
              },
              {
                step: "02",
                title: "Pilih Mata Pelajaran",
                desc: "Pilih mata pelajaran yang ingin kamu pelajari dari daftar kelas dan materi yang tersedia untukmu.",
                icon: "📚",
              },
              {
                step: "03",
                title: "Belajar & Kerjakan Quiz",
                desc: "Pelajari materi, tonton video, kerjakan tugas dan quiz untuk mengukur pemahamanmu.",
                icon: "🎯",
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-4xl mb-5 border border-slate-100">
                  {s.icon}
                </div>

                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Siap Mulai Belajar?
            </h2>

            <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
              Bergabung bersama ribuan siswa dan guru yang telah merasakan
              manfaat CittClass dalam proses pembelajaran.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition text-base shadow-xl"
            >
              Mulai Sekarang →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                </svg>
              </div>

              <span className="font-bold text-xl">CittClass</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">
              Platform Learning Management System untuk sekolah Indonesia.
              Memudahkan proses belajar mengajar yang modern dan efisien.
            </p>

            <div className="flex gap-3">
              {["Twitter", "Instagram", "Facebook", "YouTube"].map((s) => (
                <button
                  key={s}
                  className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition text-xs font-bold"
                >
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-300">
              Platform
            </h4>

            <ul className="space-y-2 text-sm text-slate-400">
              {["Beranda", "Fitur", "Cara Kerja", "Harga", "FAQ"].map(
                (l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="hover:text-white transition"
                    >
                      {l}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-300">
              Kontak
            </h4>

            <ul className="space-y-2 text-sm text-slate-400">
              <li>info@cittclass.id</li>
              <li>+62 21 1234 5678</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
          © 2026 CittClass. All rights reserved. Platform LMS untuk sekolah
          Indonesia.
        </div>
      </footer>
    </div>
  );
}