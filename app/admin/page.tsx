"use client";

/* ============================================================
   CITTCLASS — Learning Management System · Panel Admin
   File tunggal untuk app/page.tsx (Next.js App Router)
   ============================================================ */

import { useState, useEffect, useMemo } from "react";
import type { ReactNode, FormEvent } from "react";
/* ---------------- Tipe data ---------------- */
type Role = "admin" | "guru" | "siswa" | "kepsek" | "kurikulum";
type Status = "aktif" | "nonaktif";
type ActivityKind = "sesi" | "akun" | "jurusan" | "mapel" | "kelas";
type PageKey = "home" | "accounts" | "classes" | "majors" | "teachers" | "activity";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
  createdAt: number;
  nis?: string;
  nip?: string;
  jurusanId?: string;
  kelas?: string;
  subjects?: string[];
}
interface Major { id: string; code: string; name: string; desc: string; }
interface SchoolClass { id: string; name: string; level: string; majorId: string; homeroom: string; year: string; status: Status; }
interface Activity { id: string; ts: number; actor: string; action: string; target?: string; kind: ActivityKind; }
interface DB { users: User[]; majors: Major[]; classes: SchoolClass[]; activities: Activity[]; }
interface Toast { id: string; msg: string; type: "ok" | "err"; }
interface UserFormState {
  name: string; email: string; password: string; role: Role; status: Status;
  nis: string; nip: string; jurusanId: string; kelas: string;
}

/* ---------------- Konstanta ---------------- */
const DB_KEY = "cittclass_db_v1";
const SESSION_KEY = "cittclass_session_v1";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin", guru: "Guru", siswa: "Siswa",
  kepsek: "Kepala Sekolah", kurikulum: "Kurikulum",
};
const KIND_LABEL: Record<ActivityKind, string> = { sesi: "Sesi", akun: "Akun", jurusan: "Jurusan", mapel: "Mapel", kelas: "Kelas" };
const KIND_COLOR: Record<ActivityKind, string> = { sesi: "#2563EB", akun: "#0F172A", jurusan: "#F59E0B", mapel: "#38BDF8", kelas: "#60A5FA" };
const ROLE_BAR: Record<Role, string> = {
  admin: "#1A2B20", guru: "#1E5B43", siswa: "#8A6D1B", kepsek: "#C2491D", kurikulum: "#6B4A2F",
};
const AVATAR_COLORS = ["#1E5B43", "#1A2B20", "#C2491D", "#8A6D1B", "#6B4A2F"];

const SUBJECT_SUGGEST = [
  "Matematika", "Fisika", "Kimia", "Biologi", "Bahasa Indonesia", "Bahasa Inggris",
  "Pemrograman Web", "Basis Data", "Jaringan Komputer", "Keamanan Jaringan",
  "Desain Grafis", "Ilustrasi", "Akuntansi", "Ekonomi", "Geografi", "Sejarah",
  "Sosiologi", "PPKn", "PJOK", "Seni Budaya", "Prakarya & Kewirausahaan",
];

/* ---------------- Helper ---------------- */
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
const daysAgo = (n: number, h = 9) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 12, 0, 0); return d.getTime(); };
const pad2 = (n: number) => String(n).padStart(2, "0");
const hashStr = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join("") || "?";

function genPass() {
  const c = "abcdefghjkmnpqrstuvwxyz23456789ACDEFGH";
  let s = "";
  for (let i = 0; i < 10; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}
function relTime(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d === 1) return "kemarin";
  if (d < 7) return `${d} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
function dayLabel(ts: number) {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return "Hari ini";
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ---------------- Seed data ---------------- */
function makeSeed(): DB {
  const majors: Major[] = [
    { id: "mj-rpl", code: "RPL", name: "Rekayasa Perangkat Lunak", desc: "Pengembangan perangkat lunak, web, dan mobile." },
    { id: "mj-tkj", code: "TKJ", name: "Teknik Komputer & Jaringan", desc: "Instalasi, administrasi, dan keamanan jaringan." },
    { id: "mj-dkv", code: "DKV", name: "Desain Komunikasi Visual", desc: "Grafis, ilustrasi, fotografi, dan videografi." },
    { id: "mj-akl", code: "AKL", name: "Akuntansi & Keuangan Lembaga", desc: "Pelaporan keuangan dan perpajakan dasar." },
    { id: "mj-otkp", code: "OTKP", name: "Otomatisasi & Tata Kelola Perkantoran", desc: "Administrasi perkantoran modern dan kearsipan." },
    { id: "mj-tbs", code: "TBS", name: "Teknik Bisnis Sepeda Motor", desc: "Perawatan dan perbaikan kendaraan sepeda motor." },
  ];
  let seq = 0;
  const mk = (name: string, email: string, password: string, role: Role, ago: number, extra: Partial<User> = {}): User => ({
    id: uid("u"), name, email, password, role, status: "aktif", createdAt: daysAgo(ago, 9 + (seq++ % 8)), ...extra,
  });
  const users: User[] = [
    mk("Administrator Cittclass", "admin@cittclass.sch.id", "admin123", "admin", 210, { nip: "198701012010011001" }),
    mk("Drs. Suryana Hadi, M.Pd.", "suryana.hadi@cittclass.sch.id", "kepsek123", "kepsek", 205, { nip: "196503122005011002" }),
    mk("Nurul Hidayati, S.Pd.", "nurul.hidayati@cittclass.sch.id", "kurikulum123", "kurikulum", 203, { nip: "198203142009012003" }),
    mk("Hendra Gunawan, S.Kom.", "hendra.gunawan@cittclass.sch.id", "guru123", "guru", 180, { nip: "198505172011011004", subjects: ["Pemrograman Web", "Basis Data"] }),
    mk("Ratna Kusuma Dewi, S.Pd.", "ratna.kusuma@cittclass.sch.id", "guru123", "guru", 178, { nip: "198809212012012005", subjects: ["Matematika", "Fisika"] }),
    mk("Slamat Riadi, S.T.", "slamat.riadi@cittclass.sch.id", "guru123", "guru", 175, { nip: "198402152010011006", subjects: ["Jaringan Komputer", "Keamanan Jaringan"] }),
    mk("Maya Anggraini, S.Pd.", "maya.anggraini@cittclass.sch.id", "guru123", "guru", 170, { nip: "199001182014012007", subjects: ["Bahasa Inggris"] }),
    mk("Bagus Wicaksono, S.Ds.", "bagus.wicaksono@cittclass.sch.id", "guru123", "guru", 166, { nip: "198911252013011008", subjects: ["Desain Grafis", "Ilustrasi"] }),
    mk("Sri Wahyuni, S.E.", "sri.wahyuni@cittclass.sch.id", "guru123", "guru", 160, { nip: "199204052016012009", subjects: ["Akuntansi", "Ekonomi"] }),
    mk("Ahmad Fauzan, S.Pd.", "ahmad.fauzan@cittclass.sch.id", "guru123", "guru", 150, { nip: "199107192017011010", subjects: ["Bahasa Indonesia", "Sejarah"] }),
    mk("Dewi Sartika, S.Pd.", "dewi.sartika@cittclass.sch.id", "guru123", "guru", 145, { nip: "199309272018012011", subjects: ["PJOK"], status: "nonaktif" }),
    mk("Aisyah Putri Ramadhani", "aisyah.putri@siswa.cittclass.sch.id", "siswa123", "siswa", 120, { nis: "2210001", jurusanId: "mj-rpl", kelas: "XII RPL 1" }),
    mk("Bima Arya Saputra", "bima.arya@siswa.cittclass.sch.id", "siswa123", "siswa", 96, { nis: "2220014", jurusanId: "mj-tkj", kelas: "XI TKJ 2" }),
    mk("Citra Maharani", "citra.maharani@siswa.cittclass.sch.id", "siswa123", "siswa", 118, { nis: "2210032", jurusanId: "mj-dkv", kelas: "XII DKV 1" }),
    mk("Dimas Prasetyo", "dimas.prasetyo@siswa.cittclass.sch.id", "siswa123", "siswa", 92, { nis: "2230007", jurusanId: "mj-akl", kelas: "XI AKL 1" }),
    mk("Eka Wijaya", "eka.wijaya@siswa.cittclass.sch.id", "siswa123", "siswa", 117, { nis: "2210002", jurusanId: "mj-rpl", kelas: "XII RPL 2" }),
    mk("Farah Nabila", "farah.nabila@siswa.cittclass.sch.id", "siswa123", "siswa", 40, { nis: "2240019", jurusanId: "mj-otkp", kelas: "X OTKP 1" }),
    mk("Gilang Ramadhan", "gilang.ramadhan@siswa.cittclass.sch.id", "siswa123", "siswa", 88, { nis: "2250003", jurusanId: "mj-tbs", kelas: "XI TBS 1" }),
    mk("Hana Salsabila", "hana.salsabila@siswa.cittclass.sch.id", "siswa123", "siswa", 38, { nis: "2240041", jurusanId: "mj-rpl", kelas: "X RPL 1" }),
    mk("Ibrahim Musa", "ibrahim.musa@siswa.cittclass.sch.id", "siswa123", "siswa", 115, { nis: "2220006", jurusanId: "mj-tkj", kelas: "XII TKJ 1" }),
    mk("Joko Anugrah", "joko.anugrah@siswa.cittclass.sch.id", "siswa123", "siswa", 85, { nis: "2230028", jurusanId: "mj-dkv", kelas: "XI DKV 2" }),
    mk("Kirana Dewi Lestari", "kirana.lestari@siswa.cittclass.sch.id", "siswa123", "siswa", 112, { nis: "2230011", jurusanId: "mj-akl", kelas: "XII AKL 2" }),
    mk("Louis Ardiansyah", "louis.ardiansyah@siswa.cittclass.sch.id", "siswa123", "siswa", 0, { nis: "2220033", jurusanId: "mj-tkj", kelas: "X TKJ 1", createdAt: Date.now() - 26 * 60000 }),
    mk("Naufal Hakim", "naufal.hakim@siswa.cittclass.sch.id", "siswa123", "siswa", 108, { nis: "2240012", jurusanId: "mj-otkp", kelas: "XII OTKP 2" }),
    mk("Olivia Zahra", "olivia.zahra@siswa.cittclass.sch.id", "siswa123", "siswa", 84, { nis: "2210005", jurusanId: "mj-rpl", kelas: "XI RPL 1", status: "nonaktif" }),
  ];
  const mkAct = (kind: ActivityKind, action: string, target: string | undefined, ts: number): Activity =>
    ({ id: uid("a"), kind, action, target, ts, actor: "Administrator Cittclass" });
  const activities: Activity[] = [
    mkAct("sesi", "Masuk ke panel admin", undefined, Date.now() - 4 * 60000),
    mkAct("akun", "Menambahkan akun siswa", "Louis Ardiansyah", Date.now() - 26 * 60000),
    mkAct("mapel", "Memperbarui daftar mapel", "Hendra Gunawan, S.Kom.", Date.now() - 2 * 3600000),
    mkAct("akun", "Menonaktifkan akun siswa", "Olivia Zahra", Date.now() - 3 * 3600000),
    mkAct("jurusan", "Menambahkan jurusan", "Teknik Bisnis Sepeda Motor", daysAgo(1, 16)),
    mkAct("sesi", "Keluar dari panel admin", undefined, daysAgo(1, 17)),
    mkAct("akun", "Menambahkan akun guru", "Dewi Sartika, S.Pd.", daysAgo(1, 10)),
    mkAct("akun", "Menghapus akun siswa", "Rian Hidayat", daysAgo(3, 9)),
  ];
  const classes: SchoolClass[] = [
    { id: "cl-xii-rpl-1", name: "XII RPL 1", level: "XII", majorId: "mj-rpl", homeroom: "Hendra Gunawan, S.Kom.", year: "2026/2027", status: "aktif" },
    { id: "cl-xii-rpl-2", name: "XII RPL 2", level: "XII", majorId: "mj-rpl", homeroom: "Ratna Kusuma Dewi, S.Pd.", year: "2026/2027", status: "aktif" },
    { id: "cl-xi-rpl-1", name: "XI RPL 1", level: "XI", majorId: "mj-rpl", homeroom: "Hendra Gunawan, S.Kom.", year: "2026/2027", status: "aktif" },
    { id: "cl-xi-tkj-2", name: "XI TKJ 2", level: "XI", majorId: "mj-tkj", homeroom: "Slamat Riadi, S.T.", year: "2026/2027", status: "aktif" },
    { id: "cl-xii-dkv-1", name: "XII DKV 1", level: "XII", majorId: "mj-dkv", homeroom: "Bagus Wicaksono, S.Ds.", year: "2026/2027", status: "aktif" },
    { id: "cl-xi-akl-1", name: "XI AKL 1", level: "XI", majorId: "mj-akl", homeroom: "Sri Wahyuni, S.E.", year: "2026/2027", status: "aktif" },
  ];
  return { users, majors, classes, activities };
}

/* ---------------- Ikon (stroke SVG) ---------------- */
const ICONS: Record<string, ReactNode> = {
  home: <><path d="m3 9.4 9-6.9 9 6.9V20a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 20Z" /><path d="M9.5 21.3v-7.6h5v7.6" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  cap: <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" /><path d="M22 10v6" /></>,
  book: <><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  search: <><circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>,
  pencil: <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M17.94 17.94A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 5.06-5.94" /><path d="M9.9 4.74A9.9 9.9 0 0 1 12 4.5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="2" y1="2" x2="22" y2="22" /></>,
  arrowRight: <><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></>,
  key: <><path d="m21 2-2 2" /><path d="m15.5 7.5 3 3L22 7l-3-3z" /><path d="m15.5 7.5-6.09 6.09a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78Z" /></>,
  info: <><circle cx="12" cy="12" r="9.5" /><line x1="12" y1="16" x2="12" y2="11" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
};
function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] ?? null}
    </svg>
  );
}

/* ---------------- Styles ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

#cc-root, #cc-root *{ box-sizing:border-box; margin:0; padding:0; }
#cc-root{
  --paper:#F8FAFC; --paper2:#FFFFFF; --paper3:#EFF6FF; --line:#E2E8F0;
  --ink:#0F172A; --ink-soft:#64748B; --cream:#FFFFFF;
  --green:#2563EB; --green-deep:#0F172A; --terra:#EF4444; --ochre:#F59E0B; --brown:#334155;
  font-family:'Inter',sans-serif; background:var(--paper); color:var(--ink);
  min-height:100vh; font-size:15px; line-height:1.5; -webkit-font-smoothing:antialiased;
}
#cc-root ::selection{ background:var(--green); color:var(--cream); }
#cc-root button{ font-family:inherit; color:inherit; background:none; border:none; cursor:pointer; font-size:inherit; }
#cc-root input,#cc-root select{ font-family:inherit; }
#cc-root ul{ list-style:none; }
#cc-root .mono{ font-family:'IBM Plex Mono',monospace !important; }
#cc-root :focus-visible{ outline:2.5px solid var(--green); outline-offset:2px; border-radius:4px; }
#cc-root ::-webkit-scrollbar{ width:10px; height:10px; }
#cc-root ::-webkit-scrollbar-thumb{ background:#C9BFA4; border-radius:99px; border:2.5px solid var(--paper); }
#cc-root ::-webkit-scrollbar-track{ background:transparent; }

/* --- splash --- */
#cc-root .cc-splash{ min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
#cc-root .cc-splash .cc-mark{ animation:cc-pulse 1.2s ease-in-out infinite; }
@keyframes cc-pulse{ 0%,100%{opacity:.4} 50%{opacity:1} }
#cc-root .cc-mark{ width:40px; height:40px; border:1.8px solid currentColor; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; font-style:normal; font-weight:700; font-size:20px; flex:none; }

/* --- login --- */
#cc-root .cc-login{ min-height:100vh; display:grid; grid-template-columns:1.15fr 1fr; }
#cc-root .cc-login-left{ background:var(--green-deep); color:var(--cream); padding:38px 46px; display:flex; flex-direction:column; overflow:hidden; }
#cc-root .cc-login-brand{ display:flex; align-items:center; gap:12px; }
#cc-root .cc-login-brand strong{ font-family:'Fraunces',serif; font-size:21px; font-weight:600; }
#cc-root .cc-login-brand strong em{ font-style:italic; font-weight:500; }
#cc-root .cc-login-brand span{ margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; opacity:.7; border:1px solid rgba(245,241,226,.4); padding:5px 10px; border-radius:999px; }
#cc-root .cc-login-clock{ margin-top:auto; padding:30px 0 6px; }
#cc-root .cc-login-time{ font-family:'IBM Plex Mono',monospace; font-weight:500; font-size:clamp(52px,6.5vw,82px); line-height:1; letter-spacing:-.02em; }
#cc-root .cc-login-time small{ font-size:.38em; opacity:.55; font-weight:400; }
#cc-root .cc-login-date{ margin-top:12px; font-size:15px; opacity:.88; }
#cc-root .cc-login-day{ margin-top:7px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:#9DBFAC; }
#cc-root .cc-login-quote{ margin-top:26px; max-width:430px; border-left:2px solid rgba(245,241,226,.35); padding-left:14px; font-size:13.5px; line-height:1.7; opacity:.8; }
#cc-root .cc-marquee{ margin-top:34px; border-top:1px solid rgba(245,241,226,.22); padding-top:14px; overflow:hidden; white-space:nowrap; }
#cc-root .cc-marquee-track{ display:inline-flex; animation:cc-marquee 26s linear infinite; }
#cc-root .cc-marquee-track span{ flex:none; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.22em; text-transform:uppercase; opacity:.55; }
@keyframes cc-marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
#cc-root .cc-login-right{ display:flex; align-items:center; justify-content:center; padding:48px 30px; }
#cc-root .cc-login-form{ width:100%; max-width:396px; }
#cc-root .cc-kicker{ display:flex; align-items:center; gap:12px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-soft); }
#cc-root .cc-kicker::after{ content:""; flex:1; height:1px; background:var(--line); }
#cc-root .cc-login-form h1{ font-family:'Fraunces',serif; font-weight:600; font-size:34px; line-height:1.15; margin:14px 0 8px; letter-spacing:-.01em; }
#cc-root .cc-login-form h1 em{ font-style:italic; font-weight:500; }
#cc-root .cc-login-sub{ color:var(--ink-soft); font-size:14px; margin-bottom:24px; }
#cc-root .cc-login-foot{ margin-top:24px; text-align:center; font-size:11.5px; color:var(--ink-soft); }

/* --- form umum --- */
#cc-root .cc-field{ margin-bottom:15px; }
#cc-root .cc-label{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:7px; }
#cc-root .cc-input,#cc-root .cc-select{ width:100%; background:#FDFBF3; border:1.5px solid var(--ink); border-radius:9px; padding:10px 13px; font-size:14px; font-weight:500; color:var(--ink); transition:box-shadow .15s,border-color .15s; }
#cc-root .cc-input::placeholder{ color:#A79F87; font-weight:400; }
#cc-root .cc-input:focus,#cc-root .cc-select:focus{ outline:none; border-color:var(--green); box-shadow:3px 3px 0 rgba(30,91,67,.28); }
#cc-root .cc-select{ appearance:none; -webkit-appearance:none; padding-right:34px; cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231A2B20' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 11px center; }
#cc-root .cc-pass{ position:relative; }
#cc-root .cc-pass .cc-input{ padding-right:44px; }
#cc-root .cc-pass > button{ position:absolute; right:6px; top:50%; transform:translateY(-50%); width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:7px; color:var(--ink-soft); }
#cc-root .cc-pass > button:hover{ background:var(--paper3); color:var(--ink); }
#cc-root .cc-minibtn{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--green); font-weight:600; margin-top:7px; }
#cc-root .cc-minibtn:hover{ text-decoration:underline; text-underline-offset:3px; }
#cc-root .cc-err{ display:flex; gap:9px; align-items:flex-start; background:#F6E3D8; border:1.2px solid var(--terra); color:#8C3010; border-radius:9px; padding:10px 12px; font-size:13px; margin-bottom:16px; }
#cc-root .cc-err svg{ flex:none; margin-top:2px; }
#cc-root .cc-ferr{ font-size:11.5px; color:#A63D14; margin-top:5px; font-weight:500; }
#cc-root .cc-input.bad,#cc-root .cc-select.bad{ border-color:var(--terra); }
#cc-root .cc-subnote{ background:var(--paper3); border:1px dashed var(--ink-soft); border-radius:9px; padding:9px 12px; font-size:12px; color:var(--ink-soft); display:flex; gap:8px; align-items:flex-start; }
#cc-root .cc-seg{ display:inline-flex; border:1.5px solid var(--ink); border-radius:9px; overflow:hidden; background:#FDFBF3; }
#cc-root .cc-seg button{ padding:8px 16px; font-size:12.5px; font-weight:600; color:var(--ink-soft); transition:all .13s; }
#cc-root .cc-seg button.on{ background:var(--ink); color:var(--cream); }

/* --- tombol --- */
#cc-root .cc-btn{ display:inline-flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; padding:10px 17px; border:1.5px solid var(--ink); border-radius:9px; background:#FDFBF3; color:var(--ink); transition:transform .12s,box-shadow .12s,background .15s; white-space:nowrap; }
#cc-root .cc-btn:hover{ transform:translate(1px,1px); box-shadow:2px 2px 0 var(--ink); }
#cc-root .cc-btn:active{ transform:translate(3px,3px); box-shadow:0 0 0 var(--ink); }
#cc-root .cc-btn-primary{ background:var(--green); color:var(--cream); box-shadow:3px 3px 0 var(--ink); }
#cc-root .cc-btn-danger{ background:var(--terra); color:#FBEFE7; box-shadow:3px 3px 0 var(--ink); }
#cc-root .cc-btn-ghost{ background:transparent; border-color:rgba(26,43,32,.35); }
#cc-root .cc-btn-danger-ghost{ background:transparent; border-color:rgba(194,73,29,.5); color:var(--terra); }
#cc-root .cc-btn-danger-ghost:hover{ box-shadow:2px 2px 0 rgba(194,73,29,.35); }
#cc-root .cc-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
#cc-root .cc-iconbtn{ width:31px; height:31px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; color:var(--ink-soft); transition:all .13s; flex:none; }
#cc-root .cc-iconbtn:hover{ color:var(--cream); background:var(--ink); }
#cc-root .cc-iconbtn.green:hover{ background:var(--green); }
#cc-root .cc-iconbtn.danger:hover{ background:var(--terra); }
#cc-root .cc-iconbtn:disabled{ opacity:.3; cursor:not-allowed; }
#cc-root .cc-linkbtn{ display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; color:var(--green); }
#cc-root .cc-linkbtn:hover{ text-decoration:underline; text-underline-offset:3px; }

/* --- shell --- */
#cc-root .cc-app{ display:grid; grid-template-columns:240px minmax(0,1fr); min-height:100vh; }
#cc-root .cc-side{ background:var(--green-deep); color:var(--cream); position:sticky; top:0; height:100vh; display:flex; flex-direction:column; padding:22px 15px 18px; overflow-y:auto; }
#cc-root .cc-side-brand{ display:flex; align-items:center; gap:11px; padding:2px 6px 18px; border-bottom:1px solid rgba(245,241,226,.18); }
#cc-root .cc-side-brand .cc-mark{ width:36px; height:36px; font-size:18px; }
#cc-root .cc-side-brand strong{ display:block; font-family:'Fraunces',serif; font-size:18.5px; font-weight:600; line-height:1.1; }
#cc-root .cc-side-brand strong em{ font-style:italic; font-weight:500; }
#cc-root .cc-side-brand small{ display:block; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; opacity:.6; margin-top:3px; }
#cc-root .cc-nav{ margin-top:16px; display:flex; flex-direction:column; gap:3px; flex:1; }
#cc-root .cc-nav-label{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.2em; text-transform:uppercase; opacity:.45; padding:0 10px 8px; }
#cc-root .cc-nav-item{ display:flex; align-items:center; gap:10px; width:100%; padding:10px 11px; border-radius:9px; font-size:13.5px; font-weight:500; color:rgba(245,241,226,.78); transition:background .13s,color .13s; text-align:left; }
#cc-root .cc-nav-item .cc-no{ font-family:'IBM Plex Mono',monospace; font-size:10px; opacity:.5; width:18px; flex:none; }
#cc-root .cc-nav-item svg{ flex:none; opacity:.85; }
#cc-root .cc-nav-item:hover{ background:rgba(245,241,226,.09); color:var(--cream); }
#cc-root .cc-nav-item.on{ background:var(--cream); color:var(--ink); font-weight:600; }
#cc-root .cc-nav-count{ margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:10px; background:rgba(245,241,226,.14); border-radius:999px; padding:2px 7px; }
#cc-root .cc-nav-item.on .cc-nav-count{ background:rgba(26,43,32,.12); }
#cc-root .cc-side-user{ border-top:1px solid rgba(245,241,226,.18); padding-top:14px; margin-top:14px; display:flex; align-items:center; gap:10px; }
#cc-root .cc-side-user .cc-who{ min-width:0; flex:1; }
#cc-root .cc-side-user .cc-who b{ display:block; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#cc-root .cc-side-user .cc-who span{ font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; opacity:.6; }
#cc-root .cc-side-exit{ width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:rgba(245,241,226,.75); border:1px solid rgba(245,241,226,.25); flex:none; transition:all .13s; }
#cc-root .cc-side-exit:hover{ background:var(--terra); border-color:var(--terra); color:#fff; }
#cc-root .cc-main{ display:flex; flex-direction:column; min-width:0; }
#cc-root .cc-topbar{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px; padding:22px 36px 18px; border-bottom:1.5px solid var(--ink); background:var(--paper); position:sticky; top:0; z-index:10; }
#cc-root .cc-topbar .cc-crumb{ font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-soft); }
#cc-root .cc-topbar h2{ font-family:'Fraunces',serif; font-size:25px; font-weight:600; letter-spacing:-.01em; line-height:1.15; margin-top:3px; }
#cc-root .cc-topbar h2 em{ font-style:italic; font-weight:500; }
#cc-root .cc-topbar .cc-clock{ text-align:right; font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--ink-soft); line-height:1.6; }
#cc-root .cc-topbar .cc-clock b{ display:block; font-size:16px; color:var(--ink); font-weight:600; }
#cc-root .cc-content{ padding:30px 36px 70px; width:100%; max-width:1148px; animation:cc-rise .28s ease; }
@keyframes cc-rise{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none} }

/* --- panel --- */
#cc-root .cc-panel{ background:var(--paper2); border:1.5px solid var(--ink); border-radius:13px; box-shadow:5px 5px 0 var(--paper3); }
#cc-root .cc-panel-head{ display:flex; align-items:center; gap:12px; padding:15px 20px; border-bottom:1.5px solid var(--ink); flex-wrap:wrap; }
#cc-root .cc-panel-head h3{ font-family:'Fraunces',serif; font-size:18px; font-weight:600; }
#cc-root .cc-panel-head h3 em{ font-style:italic; font-weight:500; }
#cc-root .cc-spacer{ flex:1; }
#cc-root .cc-panel-foot{ padding:10px 20px; border-top:1px solid var(--line); }

/* --- beranda --- */
#cc-root .cc-greet h1{ font-family:'Fraunces',serif; font-size:clamp(28px,3.4vw,40px); font-weight:600; letter-spacing:-.015em; line-height:1.12; }
#cc-root .cc-greet h1 em{ font-style:italic; font-weight:500; }
#cc-root .cc-greet p{ color:var(--ink-soft); margin-top:8px; font-size:14.5px; max-width:620px; }
#cc-root .cc-greet p button{ color:var(--green); font-weight:600; text-decoration:underline; text-underline-offset:3px; }
#cc-root .cc-stats{ display:grid; grid-template-columns:repeat(3,1fr); margin-top:22px; border:1.5px solid var(--ink); border-radius:13px; background:var(--paper2); box-shadow:5px 5px 0 var(--paper3); overflow:hidden; }
#cc-root .cc-stat{ padding:20px 22px; border-left:1.5px solid var(--ink); }
#cc-root .cc-stat:nth-child(3n+1){ border-left:none; }
#cc-root .cc-stat:nth-child(n+4){ border-top:1.5px solid var(--ink); }
#cc-root .cc-stat small{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-soft); }
#cc-root .cc-stat b{ display:block; font-family:'Fraunces',serif; font-size:clamp(34px,3.2vw,46px); font-weight:600; line-height:1.15; margin-top:6px; letter-spacing:-.02em; }
#cc-root .cc-stat span{ display:block; font-size:11.5px; color:var(--ink-soft); margin-top:2px; }
#cc-root .cc-stat span em{ font-style:normal; color:var(--green); font-weight:600; }
#cc-root .cc-home-grid{ display:grid; grid-template-columns:1.4fr 1fr; gap:26px; margin-top:30px; align-items:start; }
#cc-root .cc-stack{ display:flex; flex-direction:column; gap:26px; }
#cc-root .cc-acts{ padding:8px 20px 14px; }
#cc-root .cc-act{ position:relative; padding:10px 0 12px 24px; border-left:1.5px solid var(--line); margin-left:4px; }
#cc-root .cc-act:last-child{ border-left-color:transparent; }
#cc-root .cc-act-dot{ position:absolute; left:-5.5px; top:16px; width:9px; height:9px; border-radius:50%; border:2px solid var(--paper2); }
#cc-root .cc-act p{ font-size:13.5px; }
#cc-root .cc-act p strong{ font-weight:600; }
#cc-root .cc-act small{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--ink-soft); margin-top:3px; }
#cc-root .cc-chips{ display:flex; gap:6px; flex-wrap:wrap; }
#cc-root .cc-chipf{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.06em; padding:4px 11px; border:1.2px solid var(--line); border-radius:999px; color:var(--ink-soft); transition:all .13s; }
#cc-root .cc-chipf:hover{ border-color:var(--ink); color:var(--ink); }
#cc-root .cc-chipf.on{ background:var(--ink); border-color:var(--ink); color:var(--cream); }
#cc-root .cc-dist{ padding:16px 20px 18px; display:flex; flex-direction:column; gap:13px; }
#cc-root .cc-dist-row{ display:grid; grid-template-columns:92px 1fr 30px; align-items:center; gap:10px; }
#cc-root .cc-dist-row small{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); }
#cc-root .cc-dist-track{ height:11px; border:1px solid rgba(26,43,32,.28); border-radius:99px; background:#FDFBF3; overflow:hidden; }
#cc-root .cc-dist-fill{ height:100%; border-radius:99px; min-width:4px; transition:width .5s cubic-bezier(.22,1,.36,1); }
#cc-root .cc-dist-row b{ font-family:'IBM Plex Mono',monospace; font-size:12px; text-align:right; }
#cc-root .cc-quick{ padding:6px 8px; }
#cc-root .cc-quick button{ display:flex; align-items:center; gap:12px; width:100%; padding:12px 12px; font-size:13.5px; font-weight:500; text-align:left; transition:all .14s; border-bottom:1px solid var(--line); }
#cc-root .cc-quick button:last-child{ border-bottom:none; }
#cc-root .cc-quick button svg:first-child{ color:var(--green); }
#cc-root .cc-quick button .cc-go{ margin-left:auto; opacity:0; transform:translateX(-4px); transition:all .14s; }
#cc-root .cc-quick button:hover{ background:var(--ink); color:var(--cream); padding-left:17px; }
#cc-root .cc-quick button:hover svg:first-child{ color:var(--cream); }
#cc-root .cc-quick button:hover .cc-go{ opacity:1; transform:none; }

/* --- toolbar & tabel --- */
#cc-root .cc-toolbar{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
#cc-root .cc-tspacer{ flex:1; }
#cc-root .cc-search{ position:relative; width:270px; max-width:100%; }
#cc-root .cc-search svg{ position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--ink-soft); pointer-events:none; }
#cc-root .cc-search .cc-input{ padding-left:36px; }
#cc-root .cc-count{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink-soft); margin-bottom:10px; }
#cc-root .cc-twrap{ border:1.5px solid var(--ink); border-radius:13px; background:var(--paper2); overflow-x:auto; box-shadow:5px 5px 0 var(--paper3); }
#cc-root .cc-twrap table{ width:100%; border-collapse:collapse; min-width:620px; }
#cc-root .cc-twrap th{ background:var(--ink); color:var(--cream); font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:500; letter-spacing:.14em; text-transform:uppercase; text-align:left; padding:11px 16px; }
#cc-root .cc-twrap td{ padding:12px 16px; border-top:1px solid var(--line); font-size:13.5px; vertical-align:middle; }
#cc-root .cc-twrap tbody tr{ transition:background .12s; }
#cc-root .cc-twrap tbody tr:hover{ background:#EFE9D6; }
#cc-root .cc-cell-user{ display:flex; align-items:center; gap:11px; min-width:0; }
#cc-root .cc-cell-user .cc-u{ min-width:0; }
#cc-root .cc-cell-user .cc-u b{ display:block; font-weight:600; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#cc-root .cc-cell-user .cc-u span{ display:block; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink-soft); }
#cc-root .cc-td-actions{ white-space:nowrap; text-align:right; }
#cc-root .cc-td-actions .cc-iconbtn{ margin-left:4px; }
#cc-root .cc-empty{ padding:46px 20px; text-align:center; color:var(--ink-soft); }
#cc-root .cc-empty svg{ opacity:.35; margin-bottom:10px; }
#cc-root .cc-empty b{ display:block; color:var(--ink); font-size:15px; font-weight:600; }
#cc-root .cc-empty p{ font-size:13px; margin-top:3px; }

/* --- badge & avatar --- */
#cc-root .cc-ava{ border-radius:9px; display:inline-flex; align-items:center; justify-content:center; font-weight:700; color:#F5F1E2; flex:none; letter-spacing:.02em; }
#cc-root .cc-badge{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:600; border-radius:999px; padding:3px 10px; border:1px solid transparent; white-space:nowrap; }
#cc-root .cc-role-admin{ background:var(--ink); color:var(--cream); }
#cc-root .cc-role-guru{ background:#DCE9DF; color:#1E5B43; border-color:rgba(30,91,67,.3); }
#cc-root .cc-role-siswa{ background:#EFE7CB; color:#7A6114; border-color:rgba(138,109,27,.3); }
#cc-root .cc-role-kepsek{ background:#F6E0D2; color:#A63D14; border-color:rgba(194,73,29,.3); }
#cc-root .cc-role-kurikulum{ background:#EADFCE; color:#6B4A2F; border-color:rgba(107,74,47,.3); }
#cc-root .cc-status{ display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; white-space:nowrap; }
#cc-root .cc-status i{ width:7px; height:7px; border-radius:50%; }
#cc-root .cc-status.ok{ color:var(--green); }
#cc-root .cc-status.ok i{ background:var(--green); }
#cc-root .cc-status.off{ color:#A63D14; }
#cc-root .cc-status.off i{ background:#A63D14; }
#cc-root .cc-mj-chip{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; font-weight:600; border:1.2px solid var(--ink); border-radius:7px; padding:3px 8px; background:var(--paper3); white-space:nowrap; }

/* --- modal --- */
#cc-root .cc-overlay{ position:fixed; inset:0; background:rgba(16,28,21,.55); display:flex; align-items:center; justify-content:center; padding:22px; z-index:90; animation:cc-fade .16s; }
@keyframes cc-fade{ from{opacity:0} }
#cc-root .cc-modal{ background:var(--paper2); border:1.5px solid var(--ink); border-radius:15px; width:100%; box-shadow:8px 8px 0 rgba(16,28,21,.8); animation:cc-pop .2s cubic-bezier(.21,1.02,.55,1.1); max-height:calc(100vh - 44px); display:flex; flex-direction:column; }
@keyframes cc-pop{ from{opacity:0; transform:translateY(14px) scale(.97)} }
#cc-root .cc-modal-head{ display:flex; align-items:flex-start; gap:14px; padding:18px 22px; border-bottom:1.5px solid var(--ink); }
#cc-root .cc-modal-head > div{ flex:1; }
#cc-root .cc-modal-head h3{ font-family:'Fraunces',serif; font-size:20px; font-weight:600; }
#cc-root .cc-modal-head p{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }
#cc-root .cc-modal-body{ padding:20px 22px; overflow-y:auto; }
#cc-root .cc-modal-foot{ padding:15px 22px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:10px; }
#cc-root .cc-fgrid{ display:grid; grid-template-columns:1fr 1fr; gap:14px 16px; }
#cc-root .cc-span2{ grid-column:span 2; }
#cc-root .cc-confirm-msg{ font-size:14px; line-height:1.65; color:var(--ink-soft); }
#cc-root .cc-confirm-msg strong{ color:var(--ink); }

/* --- jurusan & guru --- */
#cc-root .cc-two{ display:grid; grid-template-columns:340px minmax(0,1fr); gap:26px; align-items:start; }
#cc-root .cc-mj-list{ padding:10px; display:flex; flex-direction:column; gap:4px; }
#cc-root .cc-mj-item{ display:flex; align-items:center; gap:12px; padding:11px 12px; border-radius:9px; border:1.2px solid transparent; transition:all .13s; cursor:pointer; }
#cc-root .cc-mj-item:hover{ background:#EFE9D6; }
#cc-root .cc-mj-item.on{ border-color:var(--ink); background:#FDFBF3; box-shadow:3px 3px 0 var(--paper3); }
#cc-root .cc-mj-code{ font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; border:1.2px solid var(--ink); border-radius:7px; padding:5px 8px; background:var(--paper2); flex:none; min-width:46px; text-align:center; }
#cc-root .cc-mj-info{ min-width:0; flex:1; }
#cc-root .cc-mj-info b{ display:block; font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#cc-root .cc-mj-info span{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--ink-soft); }
#cc-root .cc-tch-list{ padding:10px 10px 12px; display:flex; flex-direction:column; gap:4px; max-height:540px; overflow-y:auto; }
#cc-root .cc-tch-item{ display:flex; align-items:center; gap:11px; padding:10px 11px; border-radius:9px; border:1.2px solid transparent; cursor:pointer; transition:all .13s; }
#cc-root .cc-tch-item:hover{ background:#EFE9D6; }
#cc-root .cc-tch-item.on{ border-color:var(--ink); background:#FDFBF3; box-shadow:3px 3px 0 var(--paper3); }
#cc-root .cc-tch-info{ min-width:0; }
#cc-root .cc-tch-info b{ display:block; font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#cc-root .cc-tch-info span{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--ink-soft); }
#cc-root .cc-tch-detail-head{ display:flex; align-items:center; gap:16px; padding:20px 22px; border-bottom:1.5px solid var(--ink); flex-wrap:wrap; }
#cc-root .cc-tch-name h3{ font-family:'Fraunces',serif; font-size:22px; font-weight:600; }
#cc-root .cc-tch-name p{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:var(--ink-soft); margin-top:3px; }
#cc-root .cc-subjects{ padding:18px 22px 22px; }
#cc-root .cc-subjects h4{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:12px; }
#cc-root .cc-chiplist{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
#cc-root .cc-chip{ display:inline-flex; align-items:center; gap:7px; background:#FDFBF3; border:1.3px solid var(--ink); border-radius:999px; padding:5px 6px 5px 13px; font-size:12.5px; font-weight:600; }
#cc-root .cc-chip button{ width:19px; height:19px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--ink-soft); transition:all .12s; }
#cc-root .cc-chip button:hover{ background:var(--terra); color:#fff; }
#cc-root .cc-addsub{ display:flex; gap:9px; flex-wrap:wrap; }
#cc-root .cc-addsub .cc-input{ flex:1; min-width:180px; width:auto; }

/* --- aktivitas --- */
#cc-root .cc-day{ display:flex; align-items:center; gap:12px; margin:20px 0 4px; }
#cc-root .cc-day b{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-soft); font-weight:600; }
#cc-root .cc-day::after{ content:""; flex:1; height:1px; background:var(--line); }

/* --- demo box login --- */
#cc-root .cc-demo{ margin-top:22px; border:1.5px dashed var(--ink-soft); border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:12px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--ink-soft); flex-wrap:wrap; }
#cc-root .cc-demo b{ color:var(--ink); font-weight:600; }
#cc-root .cc-demo button{ margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; text-decoration:underline; text-underline-offset:3px; color:var(--green); font-weight:600; }

#cc-root .cc-side{ background:#fff; border-right:1px solid var(--line); }
#cc-root .cc-topbar{ background:#fff; border-bottom:1px solid var(--line); }
#cc-root .cc-panel,#cc-root .cc-stats,#cc-root .cc-twrap{ background:#fff; border:1px solid var(--line); box-shadow:0 3px 14px rgba(15,23,42,.045); }
#cc-root .cc-page-head{ display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:15px; }
#cc-root .cc-form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
#cc-root .cc-btn-primary{ background:#2563EB; color:#fff; box-shadow:none; border-radius:9px; }
#cc-root .cc-nav-item.on{ background:#EFF6FF; color:#2563EB; }
#cc-root .cc-login-left{ background:#102B54; }
#cc-root .cc-login-right{ background:#F8FAFC; }
#cc-root .cc-login-form .cc-btn-primary{ background:#2563EB; }

/* --- toast --- */
#cc-root .cc-toasts{ position:fixed; right:22px; bottom:22px; z-index:120; display:flex; flex-direction:column; gap:10px; }
#cc-root .cc-toast{ display:flex; align-items:flex-start; gap:10px; background:var(--ink); color:var(--cream); border-radius:11px; padding:12px 15px; max-width:370px; font-size:13px; box-shadow:5px 5px 0 rgba(26,43,32,.25); animation:cc-toast-in .25s cubic-bezier(.21,1.02,.55,1.2); }
#cc-root .cc-toast svg{ flex:none; margin-top:1px; }
#cc-root .cc-toast.ok svg{ color:#7FC79F; }
#cc-root .cc-toast.err svg{ color:#F0A284; }
@keyframes cc-toast-in{ from{opacity:0; transform:translateY(10px) scale(.96)} to{opacity:1; transform:none} }

/* --- responsif --- */
@media (max-width:960px){
  #cc-root .cc-login{ grid-template-columns:1fr; }
  #cc-root .cc-login-left{ padding:26px 24px 22px; }
  #cc-root .cc-login-clock{ margin-top:22px; padding-top:14px; }
  #cc-root .cc-app{ grid-template-columns:1fr; }
  #cc-root .cc-side{ position:sticky; top:0; height:auto; z-index:30; padding:14px; }
  #cc-root .cc-side-brand{ border-bottom:none; padding-bottom:10px; }
  #cc-root .cc-nav{ flex-direction:row; overflow-x:auto; margin-top:4px; gap:6px; }
  #cc-root .cc-nav-label,#cc-root .cc-side-user{ display:none; }
  #cc-root .cc-nav-item{ white-space:nowrap; padding:8px 12px; }
  #cc-root .cc-nav-item .cc-no{ display:none; }
  #cc-root .cc-topbar{ padding:16px 18px 14px; }
  #cc-root .cc-topbar h2{ font-size:21px; }
  #cc-root .cc-content{ padding:20px 18px 60px; }
  #cc-root .cc-home-grid,#cc-root .cc-two{ grid-template-columns:1fr; }
  #cc-root .cc-stats{ grid-template-columns:1fr 1fr; }
  #cc-root .cc-stat{ border-left:none; }
  #cc-root .cc-stat:nth-child(even){ border-left:1.5px solid var(--ink); }
  #cc-root .cc-stat:nth-child(n+3){ border-top:1.5px solid var(--ink); }
  #cc-root .cc-fgrid{ grid-template-columns:1fr; }
  #cc-root .cc-form-grid{ grid-template-columns:1fr; gap:0; }
  #cc-root .cc-span2{ grid-column:span 1; }
  #cc-root .cc-modal{ box-shadow:5px 5px 0 rgba(16,28,21,.8); }
}
`;

/* ---------------- Komponen kecil ---------------- */
function useNow() {
  const [n, setN] = useState(() => new Date());
  useEffect(() => { const t = window.setInterval(() => setN(new Date()), 1000); return () => window.clearInterval(t); }, []);
  return n;
}
function Avatar({ user, size = 36 }: { user: Pick<User, "name" | "id">; size?: number }) {
  const c = AVATAR_COLORS[hashStr(user.id) % AVATAR_COLORS.length];
  return (
    <span className="cc-ava" style={{ width: size, height: size, background: c, fontSize: Math.max(10, Math.round(size * 0.34)) }}>
      {initials(user.name)}
    </span>
  );
}
function EmptyState({ icon = "search", title, sub }: { icon?: string; title: string; sub?: string }) {
  return (
    <div className="cc-empty">
      <Icon name={icon} size={34} />
      <b>{title}</b>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}
function Modal({ open, onClose, title, sub, children, width }:
  { open: boolean; onClose: () => void; title: string; sub?: string; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const h = (ev: KeyboardEvent) => { if (ev.key === "Escape") onClose(); };
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="cc-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cc-modal" style={width ? { maxWidth: width } : undefined} role="dialog" aria-modal="true">
        <div className="cc-modal-head">
          <div><h3>{title}</h3>{sub ? <p>{sub}</p> : null}</div>
          <button type="button" className="cc-iconbtn" onClick={onClose} aria-label="Tutup"><Icon name="x" size={17} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Hapus" }:
  { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: ReactNode; confirmLabel?: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={440}>
      <div className="cc-modal-body"><p className="cc-confirm-msg">{message}</p></div>
      <div className="cc-modal-foot">
        <button type="button" className="cc-btn" onClick={onClose}>Batal</button>
        <button type="button" className="cc-btn cc-btn-danger" onClick={onConfirm}><Icon name="trash" size={15} />{confirmLabel}</button>
      </div>
    </Modal>
  );
}
function ToastHost({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="cc-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`cc-toast ${t.type}`}>
          <Icon name={t.type === "ok" ? "check" : "info"} size={16} /><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
function ActivityRow({ a }: { a: Activity }) {
  return (
    <li className="cc-act">
      <span className="cc-act-dot" style={{ background: KIND_COLOR[a.kind] }} />
      <div>
        <p>{a.action}{a.target ? <> — <strong>{a.target}</strong></> : null}</p>
        <small>{a.actor} · {relTime(a.ts)}</small>
      </div>
    </li>
  );
}

/* ---------------- Modal akun (tambah/edit semua peran) ---------------- */
function AccountModal({ open, initial, lockRole, majors, onClose, onSave }:
  {
    open: boolean; initial: User | null; lockRole?: Role; majors: Major[];
    onClose: () => void; onSave: (f: UserFormState, editingId: string | null) => string | null;
  }) {
  const [f, setF] = useState<UserFormState>({ name: "", email: "", password: "", role: "siswa", status: "aktif", nis: "", nip: "", jurusanId: "", kelas: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [initId, setInitId] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setInitId(initial.id);
      setF({
        name: initial.name, email: initial.email, password: initial.password, role: initial.role, status: initial.status,
        nis: initial.nis ?? "", nip: initial.nip ?? "", jurusanId: initial.jurusanId ?? majors[0]?.id ?? "", kelas: initial.kelas ?? "",
      });
    } else {
      setInitId(null);
      setF({ name: "", email: "", password: genPass(), role: lockRole ?? "siswa", status: "aktif", nis: "", nip: "", jurusanId: majors[0]?.id ?? "", kelas: "" });
    }
    setErrs({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = <K extends keyof UserFormState>(k: K, v: UserFormState[K]) => setF(p => ({ ...p, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = "Nama minimal 3 karakter.";
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = "Format email tidak valid.";
    if (f.password.length < 6) er.password = "Minimal 6 karakter.";
    if (f.role === "siswa" && !f.jurusanId) er.jurusanId = "Pilih jurusan.";
    if (Object.keys(er).length) { setErrs(er); return; }
    const res = onSave(f, initId);
    if (res) setErrs({ email: res }); else onClose();
  };

  const isSiswa = f.role === "siswa";
  const isGuru = f.role === "guru";

  return (
    <Modal open={open} onClose={onClose} width={600}
      title={initId ? "Edit Akun" : "Tambah Akun Baru"}
      sub={initId ? "Perbarui data akun pengguna." : "Lengkapi data pengguna baru, pilih perannya, lalu simpan."}>
      <form onSubmit={submit} noValidate>
        <div className="cc-modal-body">
          <div className="cc-fgrid">
            <div className="cc-field">
              <label className="cc-label">Nama lengkap</label>
              <input className={`cc-input${errs.name ? " bad" : ""}`} value={f.name} onChange={e => set("name", e.target.value)} placeholder="cth. Aisyah Putri Ramadhani" />
              {errs.name && <p className="cc-ferr">{errs.name}</p>}
            </div>
            <div className="cc-field">
              <label className="cc-label">Email</label>
              <input className={`cc-input${errs.email ? " bad" : ""}`} type="email" value={f.email} onChange={e => set("email", e.target.value)} placeholder="nama@cittclass.sch.id" />
              {errs.email && <p className="cc-ferr">{errs.email}</p>}
            </div>
            <div className="cc-field">
              <label className="cc-label">Kata sandi</label>
              <div className="cc-pass">
                <input className={`cc-input${errs.password ? " bad" : ""}`} type={show ? "text" : "password"} value={f.password} onChange={e => set("password", e.target.value)} />
                <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}>
                  <Icon name={show ? "eyeOff" : "eye"} size={15} />
                </button>
              </div>
              {errs.password && <p className="cc-ferr">{errs.password}</p>}
              <button type="button" className="cc-minibtn" onClick={() => { set("password", genPass()); setShow(true); }}>
                <Icon name="key" size={13} />Buat otomatis
              </button>
            </div>
            <div className="cc-field">
              <label className="cc-label">{isSiswa ? "NIS" : "NIP / Nomor induk"}</label>
              <input className="cc-input" value={isSiswa ? f.nis : f.nip}
                onChange={e => set(isSiswa ? "nis" : "nip", e.target.value)}
                placeholder={isSiswa ? "cth. 2210001" : "opsional"} />
            </div>
            <div className="cc-field">
              <label className="cc-label">Peran</label>
              <select className="cc-select" value={f.role} disabled={!!lockRole} onChange={e => set("role", e.target.value as Role)}>
                {(Object.keys(ROLE_LABEL) as Role[]).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            <div className="cc-field">
              <label className="cc-label">Status akun</label>
              <div className="cc-seg">
                <button type="button" className={f.status === "aktif" ? "on" : ""} onClick={() => set("status", "aktif")}>Aktif</button>
                <button type="button" className={f.status === "nonaktif" ? "on" : ""} onClick={() => set("status", "nonaktif")}>Nonaktif</button>
              </div>
            </div>
            {isSiswa && (
              <>
                <div className="cc-field">
                  <label className="cc-label">Jurusan</label>
                  <select className={`cc-select${errs.jurusanId ? " bad" : ""}`} value={f.jurusanId} onChange={e => set("jurusanId", e.target.value)}>
                    {majors.length === 0 && <option value="">Belum ada jurusan</option>}
                    {majors.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                  </select>
                  {errs.jurusanId && <p className="cc-ferr">{errs.jurusanId}</p>}
                </div>
                <div className="cc-field">
                  <label className="cc-label">Kelas</label>
                  <input className="cc-input" value={f.kelas} onChange={e => set("kelas", e.target.value)} placeholder="cth. XI RPL 1" />
                </div>
              </>
            )}
            {isGuru && (
              <div className="cc-subnote cc-span2">
                <Icon name="info" size={14} />
                <span>Mata pelajaran yang diampu diatur pada menu <b>&nbsp;Guru &amp; Mapel&nbsp;</b> setelah akun dibuat.</span>
              </div>
            )}
          </div>
        </div>
        <div className="cc-modal-foot">
          <button type="button" className="cc-btn" onClick={onClose}>Batal</button>
          <button type="submit" className="cc-btn cc-btn-primary"><Icon name="check" size={15} />{initId ? "Simpan Perubahan" : "Buat Akun"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Modal jurusan ---------------- */
function MajorModal({ open, initial, onClose, onSave }:
  { open: boolean; initial: Major | null; onClose: () => void; onSave: (d: { code: string; name: string; desc: string }, editingId: string | null) => string | null }) {
  const [form, setForm] = useState({ code: "", name: "", desc: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [initId, setInitId] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setInitId(initial?.id ?? null);
    setForm(initial ? { code: initial.code, name: initial.name, desc: initial.desc } : { code: "", name: "", desc: "" });
    setErrs({});
  }, [open, initial]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.code.trim().length < 2) er.code = "Kode 2–5 karakter.";
    if (form.name.trim().length < 3) er.name = "Nama minimal 3 karakter.";
    if (Object.keys(er).length) { setErrs(er); return; }
    const res = onSave(form, initId);
    if (res) setErrs({ code: res }); else onClose();
  };
  return (
    <Modal open={open} onClose={onClose} width={520}
      title={initId ? "Edit Jurusan" : "Tambah Jurusan"} sub="Program keahlian yang tersedia bagi siswa.">
      <form onSubmit={submit} noValidate>
        <div className="cc-modal-body">
          <div className="cc-fgrid">
            <div className="cc-field">
              <label className="cc-label">Kode</label>
              <input className={`cc-input${errs.code ? " bad" : ""}`} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} maxLength={5} placeholder="cth. RPL" />
              {errs.code && <p className="cc-ferr">{errs.code}</p>}
            </div>
            <div className="cc-field">
              <label className="cc-label">Nama jurusan</label>
              <input className={`cc-input${errs.name ? " bad" : ""}`} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="cth. Rekayasa Perangkat Lunak" />
              {errs.name && <p className="cc-ferr">{errs.name}</p>}
            </div>
            <div className="cc-field cc-span2">
              <label className="cc-label">Deskripsi singkat</label>
              <input className="cc-input" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Fokus pembelajaran jurusan ini…" />
            </div>
          </div>
        </div>
        <div className="cc-modal-foot">
          <button type="button" className="cc-btn" onClick={onClose}>Batal</button>
          <button type="submit" className="cc-btn cc-btn-primary"><Icon name="check" size={15} />Simpan</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Halaman: Beranda ---------------- */
function PageHome({ db, adminName, goto }: { db: DB; adminName: string; goto: (p: PageKey) => void }) {
  const now = new Date();
  const h = now.getHours();
  const greet = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam";
  const [af, setAf] = useState<"semua" | ActivityKind>("semua");

  const siswa = db.users.filter(u => u.role === "siswa").length;
  const guru = db.users.filter(u => u.role === "guru").length;
  const aktif = db.users.filter(u => u.status === "aktif").length;
  const totalKelas = db.classes.filter(c => c.status === "aktif").length;
  const totalMapel = new Set(db.users.flatMap(u => u.subjects ?? [])).size;
  const baru = db.users.filter(u => now.getTime() - u.createdAt < 7 * 864e5).length;
  const hariIni = db.activities.filter(a => new Date(a.ts).toDateString() === now.toDateString()).length;

  const acts = useMemo(() =>
    db.activities.filter(a => af === "semua" || a.kind === af).slice(0, 6),
    [db.activities, af]);

  const roleOrder: Role[] = ["siswa", "guru", "admin", "kurikulum", "kepsek"];
  const maxRole = Math.max(1, ...roleOrder.map(r => db.users.filter(u => u.role === r).length));

  const QUICK: { icon: string; label: string; page: PageKey }[] = [
    { icon: "userPlus", label: "Tambah akun pengguna baru", page: "accounts" },
    { icon: "plus", label: "Tambah kelas baru", page: "classes" },
    { icon: "layers", label: "Kelola jurusan & data siswa", page: "majors" },
    { icon: "book", label: "Atur mapel yang diampu guru", page: "teachers" },
    { icon: "activity", label: "Lihat seluruh riwayat aktivitas", page: "activity" },
  ];

  return (
    <div>
      <div className="cc-greet">
        <h1>{greet}, <em>{adminName}</em>.</h1>
        <p>
          Ada {hariIni} aktivitas tercatat hari ini — semuanya berjalan tertib.{" "}
          <button onClick={() => goto("activity")}>Lihat riwayat lengkap</button>
        </p>
      </div>

      <div className="cc-stats">
        <div className="cc-stat"><small>Total Akun</small><b>{db.users.length}</b><span>{aktif} akun aktif</span></div>
        <div className="cc-stat"><small>Guru</small><b>{guru}</b><span>{db.users.filter(u => u.role === "guru" && u.status === "aktif").length} aktif mengajar</span></div>
        <div className="cc-stat"><small>Siswa</small><b>{siswa}</b><span>{baru > 0 ? <><em>+{baru}</em> baru minggu ini</> : "terdaftar"}</span></div>
        <div className="cc-stat"><small>Kelas</small><b>{totalKelas}</b><span>kelas terdaftar</span></div>
        <div className="cc-stat"><small>Jurusan</small><b>{db.majors.length}</b><span>program keahlian</span></div>
        <div className="cc-stat"><small>Mata Pelajaran</small><b>{totalMapel}</b><span>diampu oleh guru</span></div>
      </div>

      <div className="cc-home-grid">
        <section className="cc-panel">
          <div className="cc-panel-head">
            <h3>Aktivitas <em>Terbaru</em></h3>
            <span className="cc-spacer" />
            <div className="cc-chips">
              {(["semua", "akun", "jurusan", "mapel", "sesi"] as const).map(k => (
                <button key={k} className={`cc-chipf${af === k ? " on" : ""}`} onClick={() => setAf(k)}>
                  {k === "semua" ? "Semua" : KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
          {acts.length === 0
            ? <EmptyState icon="activity" title="Belum ada aktivitas" sub="Setiap perubahan akan tercatat otomatis di sini." />
            : <ul className="cc-acts">{acts.map(a => <ActivityRow key={a.id} a={a} />)}</ul>}
          <div className="cc-panel-foot">
            <button className="cc-linkbtn" onClick={() => goto("activity")}>Lihat semua aktivitas <Icon name="arrowRight" size={14} /></button>
          </div>
        </section>

        <div className="cc-stack">
          <section className="cc-panel">
            <div className="cc-panel-head"><h3>Distribusi <em>Peran</em></h3></div>
            <div className="cc-dist">
              {roleOrder.map(r => {
                const c = db.users.filter(u => u.role === r).length;
                return (
                  <div className="cc-dist-row" key={r}>
                    <small>{ROLE_LABEL[r]}</small>
                    <div className="cc-dist-track">
                      <div className="cc-dist-fill" style={{ width: `${Math.round((c / maxRole) * 100)}%`, background: ROLE_BAR[r] }} />
                    </div>
                    <b>{c}</b>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="cc-panel">
            <div className="cc-panel-head"><h3>Akses <em>Cepat</em></h3></div>
            <div className="cc-quick">
              {QUICK.map(q => (
                <button key={q.label} onClick={() => goto(q.page)}>
                  <Icon name={q.icon} size={16} /><span>{q.label}</span>
                  <Icon name="arrowRight" size={15} className="cc-go" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Halaman: Manajemen Kelas ---------------- */
function PageClasses({ classes, majors, users, onSave, onDeactivate }: {
  classes: SchoolClass[]; majors: Major[]; users: User[];
  onSave: (data: Omit<SchoolClass, "id">, editingId: string | null) => string | null;
  onDeactivate: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<SchoolClass | "new" | null>(null);
  const [del, setDel] = useState<SchoolClass | null>(null);
  const [err, setErr] = useState("");
  const teachers = users.filter(u => u.role === "guru" && u.status === "aktif");
  const filtered = classes.filter(c => `${c.name} ${c.level} ${c.homeroom}`.toLowerCase().includes(q.toLowerCase()));
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const problem = onSave({ name: String(form.get("name") ?? "").trim(), level: String(form.get("level") ?? "X"), majorId: String(form.get("majorId") ?? ""), homeroom: String(form.get("homeroom") ?? ""), year: String(form.get("year") ?? "2026/2027"), status: String(form.get("status") ?? "aktif") as Status }, modal !== "new" && modal ? modal.id : null);
    if (problem) { setErr(problem); return; }
    setModal(null); setErr("");
  };
  return <div>
    <div className="cc-page-head"><div><p className="cc-page-sub">Atur rombongan belajar, wali kelas, dan tahun ajaran.</p></div><button className="cc-btn cc-btn-primary" onClick={() => setModal("new")}><Icon name="plus" size={15}/>Tambah Kelas</button></div>
    <section className="cc-panel">
      <div className="cc-panel-head"><h3>Daftar <em>Kelas</em></h3><div className="cc-tools"><input className="cc-input" placeholder="Cari kelas atau wali kelas…" value={q} onChange={e => setQ(e.target.value)} aria-label="Cari kelas"/><span className="cc-count">{filtered.length} kelas</span></div></div>
      {filtered.length === 0 ? <EmptyState icon="layers" title="Kelas belum tersedia" sub="Tambahkan kelas untuk mulai menata rombongan belajar."/> : <div className="cc-twrap"><table className="cc-table"><thead><tr><th>KELAS</th><th>JURUSAN</th><th>WALI KELAS</th><th>SISWA</th><th>TAHUN AJARAN</th><th>STATUS</th><th/></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><b>{c.name}</b><small>Tingkat {c.level}</small></td><td>{majors.find(m => m.id === c.majorId)?.code ?? "—"}</td><td>{c.homeroom || "Belum ditentukan"}</td><td>{users.filter(u => u.role === "siswa" && u.kelas === c.name).length}</td><td>{c.year}</td><td><span className={`cc-status ${c.status === "aktif" ? "ok" : "off"}`}><i/>{c.status === "aktif" ? "Aktif" : "Nonaktif"}</span></td><td><div className="cc-row-actions"><button className="cc-iconbtn" title="Edit kelas" aria-label={`Edit ${c.name}`} onClick={() => setModal(c)}><Icon name="pencil" size={14}/></button>{c.status === "aktif" && <button className="cc-iconbtn danger" title="Nonaktifkan kelas" aria-label={`Nonaktifkan ${c.name}`} onClick={() => setDel(c)}><Icon name="trash" size={14}/></button>}</div></td></tr>)}</tbody></table></div>}
    </section>
    {modal && <Modal open title={modal === "new" ? "Tambah kelas" : "Edit kelas"} sub="Lengkapi informasi rombongan belajar." onClose={() => { setModal(null); setErr(""); }}><form onSubmit={save}><div className="cc-modal-body"><div className="cc-field"><label className="cc-label">Nama kelas <b>*</b></label><input name="name" className="cc-input" required placeholder="Contoh: XII PPLG 1" defaultValue={modal === "new" ? "" : modal.name}/></div><div className="cc-form-grid"><div className="cc-field"><label className="cc-label">Tingkat <b>*</b></label><select name="level" className="cc-select" defaultValue={modal === "new" ? "X" : modal.level}><option>X</option><option>XI</option><option>XII</option></select></div><div className="cc-field"><label className="cc-label">Jurusan <b>*</b></label><select name="majorId" className="cc-select" required defaultValue={modal === "new" ? "" : modal.majorId}><option value="" disabled>Pilih jurusan</option>{majors.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}</select></div></div><div className="cc-field"><label className="cc-label">Wali kelas</label><select name="homeroom" className="cc-select" defaultValue={modal === "new" ? "" : modal.homeroom}><option value="">Belum ditentukan</option>{teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div><div className="cc-form-grid"><div className="cc-field"><label className="cc-label">Tahun ajaran <b>*</b></label><input name="year" className="cc-input" required defaultValue={modal === "new" ? "2026/2027" : modal.year}/></div><div className="cc-field"><label className="cc-label">Status</label><select name="status" className="cc-select" defaultValue={modal === "new" ? "aktif" : modal.status}><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select></div></div>{err && <div className="cc-err"><Icon name="info" size={15}/>{err}</div>}</div><div className="cc-modal-foot"><button type="button" className="cc-btn" onClick={() => setModal(null)}>Batal</button><button type="submit" className="cc-btn cc-btn-primary"><Icon name="check" size={15}/>Simpan kelas</button></div></form></Modal>}
    <ConfirmModal open={!!del} title="Nonaktifkan kelas?" confirmLabel="Nonaktifkan" onClose={() => setDel(null)} message={<>Kelas <strong>{del?.name}</strong> akan dinonaktifkan. Data siswa dan riwayat tetap tersimpan.</>} onConfirm={() => { if (del) onDeactivate(del.id); setDel(null); }}/>
  </div>;
}

/* ---------------- Halaman: Kelola Akun ---------------- */
function PageAccounts({ users, majors, currentUserId, onSave, onDelete }:
  {
    users: User[]; majors: Major[]; currentUserId: string;
    onSave: (f: UserFormState, editingId: string | null) => string | null;
    onDelete: (id: string) => void;
  }) {
  const [q, setQ] = useState("");
  const [rf, setRf] = useState<"semua" | Role>("semua");
  const [modal, setModal] = useState<{ open: boolean; editing: User | null } | null>(null);
  const [del, setDel] = useState<User | null>(null);

  const list = useMemo(() => users
    .filter(u => rf === "semua" || u.role === rf)
    .filter(u => {
      const s = q.trim().toLowerCase();
      return !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    })
    .sort((a, b) => a.name.localeCompare(b.name)), [users, q, rf]);

  return (
    <div>
      <div className="cc-toolbar">
        <div className="cc-search">
          <Icon name="search" size={15} />
          <input className="cc-input" placeholder="Cari nama atau email…" value={q} onChange={e => setQ(e.target.value)} aria-label="Cari akun" />
        </div>
        <select className="cc-select" style={{ width: 190 }} value={rf} onChange={e => setRf(e.target.value as Role | "semua")} aria-label="Filter peran">
          <option value="semua">Semua peran</option>
          {(Object.keys(ROLE_LABEL) as Role[]).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <span className="cc-tspacer" />
        <button className="cc-btn cc-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
          <Icon name="plus" size={15} />Tambah Akun
        </button>
      </div>
      <p className="cc-count">Menampilkan {list.length} dari {users.length} akun</p>

      <div className="cc-twrap">
        {list.length === 0
          ? <EmptyState title="Tidak ada akun yang cocok" sub="Coba ubah kata kunci atau filter peran." />
          : (
            <table>
              <thead>
                <tr><th>Pengguna</th><th>Peran</th><th>Status</th><th>Dibuat</th><th style={{ textAlign: "right" }}>Aksi</th></tr>
              </thead>
              <tbody>
                {list.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="cc-cell-user">
                        <Avatar user={u} size={36} />
                        <div className="cc-u"><b>{u.name}</b><span>{u.email}</span></div>
                      </div>
                    </td>
                    <td><span className={`cc-badge cc-role-${u.role}`}>{ROLE_LABEL[u.role]}</span></td>
                    <td>
                      <span className={`cc-status ${u.status === "aktif" ? "ok" : "off"}`}><i />{u.status === "aktif" ? "Aktif" : "Nonaktif"}</span>
                    </td>
                    <td><span className="mono" style={{ fontSize: 11.5 }}>{fmtDate(u.createdAt)}</span></td>
                    <td className="cc-td-actions">
                      <button className="cc-iconbtn green" title="Edit akun" aria-label={`Edit ${u.name}`} onClick={() => setModal({ open: true, editing: u })}><Icon name="pencil" size={15} /></button>
        <button className="cc-iconbtn danger" title={u.id === currentUserId ? "Tidak dapat menonaktifkan akun sendiri" : "Nonaktifkan akun"}
          aria-label={`Nonaktifkan ${u.name}`} disabled={u.id === currentUserId} onClick={() => setDel(u)}>
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      <AccountModal open={!!modal?.open} initial={modal?.editing ?? null} majors={majors}
        onClose={() => setModal(null)} onSave={onSave} />
      <ConfirmModal open={!!del} title="Nonaktifkan akun?" confirmLabel="Nonaktifkan" onClose={() => setDel(null)}
        message={<>Akun <strong>{del?.name}</strong> ({del ? ROLE_LABEL[del.role].toLowerCase() : ""}) akan dinonaktifkan. Riwayat dan data terkait tetap tersimpan.</>}
        onConfirm={() => { if (del) onDelete(del.id); setDel(null); }} />
    </div>
  );
}

/* ---------------- Halaman: Jurusan & Siswa ---------------- */
function PageMajors({ majors, users, onSaveMajor, onDeleteMajor, onSaveUser, onDeleteUser }:
  {
    majors: Major[]; users: User[];
    onSaveMajor: (d: { code: string; name: string; desc: string }, editingId: string | null) => string | null;
    onDeleteMajor: (id: string) => void;
    onSaveUser: (f: UserFormState, editingId: string | null) => string | null;
    onDeleteUser: (id: string) => void;
  }) {
  const [selId, setSelId] = useState<string | "all">("all");
  const [q, setQ] = useState("");
  const [mjModal, setMjModal] = useState<{ open: boolean; editing: Major | null } | null>(null);
  const [mjDel, setMjDel] = useState<Major | null>(null);
  const [swModal, setSwModal] = useState<{ open: boolean; editing: User | null } | null>(null);
  const [swDel, setSwDel] = useState<User | null>(null);

  const siswaAll = useMemo(() => users.filter(u => u.role === "siswa"), [users]);
  const listSiswa = useMemo(() => siswaAll
    .filter(u => selId === "all" || u.jurusanId === selId)
    .filter(u => {
      const s = q.trim().toLowerCase();
      return !s || u.name.toLowerCase().includes(s) || (u.nis ?? "").includes(s);
    })
    .sort((a, b) => a.name.localeCompare(b.name)), [siswaAll, selId, q]);

  const selMajor = majors.find(m => m.id === selId);

  return (
    <div className="cc-two">
      <section className="cc-panel">
        <div className="cc-panel-head">
          <h3>Jurusan</h3>
          <span className="cc-spacer" />
          <button className="cc-btn" onClick={() => setMjModal({ open: true, editing: null })}><Icon name="plus" size={14} />Tambah</button>
        </div>
        <div className="cc-mj-list">
          <div className={`cc-mj-item${selId === "all" ? " on" : ""}`} role="button" tabIndex={0}
            onClick={() => setSelId("all")} onKeyDown={e => { if (e.key === "Enter") setSelId("all"); }}>
            <span className="cc-mj-code">ALL</span>
            <span className="cc-mj-info"><b>Semua jurusan</b><span>{siswaAll.length} siswa</span></span>
          </div>
          {majors.map(m => {
            const c = siswaAll.filter(u => u.jurusanId === m.id).length;
            return (
              <div key={m.id} className={`cc-mj-item${selId === m.id ? " on" : ""}`} role="button" tabIndex={0}
                onClick={() => setSelId(m.id)} onKeyDown={e => { if (e.key === "Enter") setSelId(m.id); }}>
                <span className="cc-mj-code">{m.code}</span>
                <span className="cc-mj-info"><b>{m.name}</b><span>{c} siswa</span></span>
                <span style={{ display: "flex" }} onClick={e => e.stopPropagation()}>
                  <button className="cc-iconbtn green" title="Edit jurusan" aria-label={`Edit ${m.name}`} onClick={() => setMjModal({ open: true, editing: m })}><Icon name="pencil" size={14} /></button>
                  <button className="cc-iconbtn danger" title="Hapus jurusan" aria-label={`Hapus ${m.name}`} onClick={() => setMjDel(m)}><Icon name="trash" size={14} /></button>
                </span>
              </div>
            );
          })}
          {majors.length === 0 && <div className="cc-empty"><b>Belum ada jurusan</b><p>Tambahkan jurusan pertama sekolahmu.</p></div>}
        </div>
      </section>

      <section>
        <div className="cc-toolbar">
          <div className="cc-search">
            <Icon name="search" size={15} />
            <input className="cc-input" placeholder="Cari nama atau NIS siswa…" value={q} onChange={e => setQ(e.target.value)} aria-label="Cari siswa" />
          </div>
          <span className="cc-tspacer" />
          <button className="cc-btn cc-btn-primary" onClick={() => setSwModal({ open: true, editing: null })}><Icon name="plus" size={15} />Tambah Siswa</button>
        </div>
        <p className="cc-count">{listSiswa.length} siswa{selMajor ? ` di jurusan ${selMajor.code}` : ""}</p>
        <div className="cc-twrap">
          {listSiswa.length === 0
            ? <EmptyState title="Tidak ada siswa" sub="Coba ubah filter jurusan atau tambahkan siswa baru." />
            : (
              <table>
                <thead>
                  <tr><th>Siswa</th><th>NIS</th><th>Jurusan</th><th>Kelas</th><th>Status</th><th style={{ textAlign: "right" }}>Aksi</th></tr>
                </thead>
                <tbody>
                  {listSiswa.map(u => {
                    const m = majors.find(x => x.id === u.jurusanId);
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="cc-cell-user">
                            <Avatar user={u} size={36} />
                            <div className="cc-u"><b>{u.name}</b><span>{u.email}</span></div>
                          </div>
                        </td>
                        <td><span className="mono" style={{ fontSize: 12 }}>{u.nis ?? "—"}</span></td>
                        <td>{m ? <span className="cc-mj-chip">{m.code}</span> : <span style={{ color: "var(--ink-soft)" }}>—</span>}</td>
                        <td>{u.kelas ?? "—"}</td>
                        <td>
                          <span className={`cc-status ${u.status === "aktif" ? "ok" : "off"}`}><i />{u.status === "aktif" ? "Aktif" : "Nonaktif"}</span>
                        </td>
                        <td className="cc-td-actions">
                          <button className="cc-iconbtn green" title="Edit siswa" aria-label={`Edit ${u.name}`} onClick={() => setSwModal({ open: true, editing: u })}><Icon name="pencil" size={15} /></button>
      <button className="cc-iconbtn danger" title="Nonaktifkan siswa" aria-label={`Nonaktifkan ${u.name}`} onClick={() => setSwDel(u)}><Icon name="trash" size={15} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>
      </section>

      <MajorModal open={!!mjModal?.open} initial={mjModal?.editing ?? null} onClose={() => setMjModal(null)} onSave={onSaveMajor} />
      <AccountModal open={!!swModal?.open} initial={swModal?.editing ?? null} lockRole="siswa" majors={majors}
        onClose={() => setSwModal(null)} onSave={onSaveUser} />
      <ConfirmModal open={!!mjDel} title="Hapus jurusan?" onClose={() => setMjDel(null)}
        message={<>Jurusan <strong>{mjDel?.name}</strong> akan dihapus. {mjDel && siswaAll.filter(u => u.jurusanId === mjDel.id).length > 0
          ? <><strong>{siswaAll.filter(u => u.jurusanId === mjDel.id).length} siswa</strong> akan dilepas dari jurusan ini.</>
          : "Tidak ada siswa yang terdampak."}</>}
        onConfirm={() => { if (mjDel) onDeleteMajor(mjDel.id); setMjDel(null); }} />
      <ConfirmModal open={!!swDel} title="Nonaktifkan akun siswa?" confirmLabel="Nonaktifkan" onClose={() => setSwDel(null)}
        message={<>Akun siswa <strong>{swDel?.name}</strong> akan dinonaktifkan. Riwayat pembelajaran tetap tersimpan.</>}
        onConfirm={() => { if (swDel) onDeleteUser(swDel.id); setSwDel(null); }} />
    </div>
  );
}

/* ---------------- Halaman: Guru & Mapel ---------------- */
function PageTeachers({ users, majors, onSave, onDelete, onSetSubjects, toast }:
  {
    users: User[]; majors: Major[];
    onSave: (f: UserFormState, editingId: string | null) => string | null;
    onDelete: (id: string) => void;
    onSetSubjects: (teacherId: string, subjects: string[], logAction?: string) => void;
    toast: (m: string, t?: "ok" | "err") => void;
  }) {
  const teachers = useMemo(() => users.filter(u => u.role === "guru").sort((a, b) => a.name.localeCompare(b.name)), [users]);
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: User | null } | null>(null);
  const [del, setDel] = useState<User | null>(null);
  const [subInput, setSubInput] = useState("");

  const filtered = teachers.filter(t => {
    const s = q.trim().toLowerCase();
    return !s || t.name.toLowerCase().includes(s) || (t.subjects ?? []).some(x => x.toLowerCase().includes(s));
  });
  const sel: User | undefined = filtered.find(t => t.id === selId) ?? filtered[0];

  const addSub = () => {
    if (!sel) return;
    const v = subInput.trim();
    if (!v) return;
    if ((sel.subjects ?? []).some(x => x.toLowerCase() === v.toLowerCase())) {
      toast(`Mapel "${v}" sudah ada untuk ${sel.name}.`, "err");
      return;
    }
    onSetSubjects(sel.id, [...(sel.subjects ?? []), v], `Menambahkan mapel "${v}"`);
    setSubInput("");
    toast(`Mapel "${v}" ditambahkan untuk ${sel.name}.`);
  };
  const removeSub = (s: string) => {
    if (!sel) return;
    onSetSubjects(sel.id, (sel.subjects ?? []).filter(x => x !== s), `Menghapus mapel "${s}"`);
    toast(`Mapel "${s}" dilepas dari ${sel.name}.`);
  };

  return (
    <div className="cc-two">
      <section className="cc-panel">
        <div className="cc-panel-head">
          <h3>Guru</h3>
          <span className="cc-spacer" />
          <button className="cc-btn" onClick={() => setModal({ open: true, editing: null })}><Icon name="plus" size={14} />Tambah</button>
        </div>
        <div style={{ padding: "12px 12px 0" }}>
          <div className="cc-search" style={{ width: "100%" }}>
            <Icon name="search" size={15} />
            <input className="cc-input" placeholder="Cari guru atau mapel…" value={q} onChange={e => setQ(e.target.value)} aria-label="Cari guru" />
          </div>
        </div>
        <div className="cc-tch-list">
          {filtered.map(t => (
            <div key={t.id} className={`cc-tch-item${sel?.id === t.id ? " on" : ""}`} role="button" tabIndex={0}
              onClick={() => setSelId(t.id)}
              onKeyDown={e => { if (e.key === "Enter") setSelId(t.id); }}>
              <Avatar user={t} size={36} />
              <span className="cc-tch-info">
                <b>{t.name}</b>
                <span>{(t.subjects ?? []).length} mapel · {t.status === "aktif" ? "aktif" : "nonaktif"}</span>
              </span>
            </div>
          ))}
          {filtered.length === 0 && <div className="cc-empty"><Icon name="search" size={30} /><b>Tidak ditemukan</b></div>}
        </div>
      </section>

      {sel ? (
        <section className="cc-panel">
          <div className="cc-tch-detail-head">
            <Avatar user={sel} size={54} />
            <div className="cc-tch-name" style={{ flex: 1, minWidth: 180 }}>
              <h3>{sel.name}</h3>
              <p>{sel.email}{sel.nip ? ` · NIP ${sel.nip}` : ""}</p>
            </div>
            <span className={`cc-status ${sel.status === "aktif" ? "ok" : "off"}`}><i />{sel.status === "aktif" ? "Aktif" : "Nonaktif"}</span>
            <button className="cc-btn" onClick={() => setModal({ open: true, editing: sel })}><Icon name="pencil" size={14} />Edit profil</button>
            <button className="cc-btn cc-btn-danger-ghost" onClick={() => setDel(sel)}><Icon name="trash" size={14} />Hapus</button>
          </div>
          <div className="cc-subjects">
            <h4>Mata Pelajaran Diampu — {(sel.subjects ?? []).length}</h4>
            {(sel.subjects ?? []).length > 0 ? (
              <div className="cc-chiplist">
                {(sel.subjects ?? []).map(s => (
                  <span className="cc-chip" key={s}>
                    {s}
                    <button onClick={() => removeSub(s)} aria-label={`Lepas ${s}`} title="Lepas mapel"><Icon name="x" size={12} /></button>
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
                Belum mengampu mata pelajaran apa pun — tambahkan lewat kolom di bawah.
              </p>
            )}
            <form className="cc-addsub" onSubmit={e => { e.preventDefault(); addSub(); }}>
              <input className="cc-input" list="cc-subject-suggest" placeholder="Tulis nama mata pelajaran…"
                value={subInput} onChange={e => setSubInput(e.target.value)} aria-label="Mata pelajaran baru" />
              <datalist id="cc-subject-suggest">
                {SUBJECT_SUGGEST.map(s => <option key={s} value={s} />)}
              </datalist>
              <button type="submit" className="cc-btn cc-btn-primary"><Icon name="plus" size={14} />Tambah Mapel</button>
            </form>
          </div>
        </section>
      ) : (
        <section className="cc-panel">
          <EmptyState icon="users" title="Belum ada guru" sub="Tambahkan guru pertama untuk mulai mengatur mapel." />
        </section>
      )}

      <AccountModal open={!!modal?.open} initial={modal?.editing ?? null} lockRole="guru" majors={majors}
        onClose={() => setModal(null)} onSave={onSave} />
      <ConfirmModal open={!!del} title="Nonaktifkan akun guru?" confirmLabel="Nonaktifkan" onClose={() => setDel(null)}
        message={<>Akun guru <strong>{del?.name}</strong> akan dinonaktifkan. Riwayat dan daftar mapel tetap tersimpan.</>}
        onConfirm={() => { if (del) onDelete(del.id); setDel(null); }} />
    </div>
  );
}

/* ---------------- Halaman: Aktivitas ---------------- */
function PageActivity({ activities, onClear }: { activities: Activity[]; onClear: () => void }) {
  const [kind, setKind] = useState<"semua" | ActivityKind>("semua");
  const [confirm, setConfirm] = useState(false);

  const filtered = useMemo(() =>
    [...activities].filter(a => kind === "semua" || a.kind === kind).sort((a, b) => b.ts - a.ts),
    [activities, kind]);

  const groups: { label: string; items: Activity[] }[] = [];
  filtered.forEach(a => {
    const label = dayLabel(a.ts);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(a);
    else groups.push({ label, items: [a] });
  });

  return (
    <div>
      <div className="cc-toolbar">
        <div className="cc-chips">
          {(["semua", "akun", "jurusan", "mapel", "sesi"] as const).map(k => (
            <button key={k} className={`cc-chipf${kind === k ? " on" : ""}`} onClick={() => setKind(k)}>
              {k === "semua" ? "Semua" : KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <span className="cc-tspacer" />
        <button className="cc-btn cc-btn-danger-ghost" onClick={() => setConfirm(true)} disabled={activities.length === 0}>
          <Icon name="trash" size={14} />Bersihkan Log
        </button>
      </div>

      <section className="cc-panel">
        <div className="cc-panel-head">
          <h3>Riwayat <em>Aktivitas</em></h3>
          <span className="cc-spacer" />
          <span className="cc-count" style={{ margin: 0 }}>{filtered.length} entri</span>
        </div>
        {filtered.length === 0
          ? <EmptyState icon="activity" title="Belum ada aktivitas" sub="Semua perubahan pada sistem akan tercatat di sini." />
          : (
            <div style={{ padding: "6px 20px 20px" }}>
              {groups.map(g => (
                <div key={g.label}>
                  <div className="cc-day"><b>{g.label}</b></div>
                  <ul className="cc-acts">{g.items.map(a => <ActivityRow key={a.id} a={a} />)}</ul>
                </div>
              ))}
            </div>
          )}
      </section>

      <ConfirmModal open={confirm} title="Bersihkan riwayat?" confirmLabel="Bersihkan"
        message="Seluruh catatan aktivitas akan dihapus permanen dari panel ini."
        onClose={() => setConfirm(false)}
        onConfirm={() => { onClear(); setConfirm(false); }} />
    </div>
  );
}

/* ---------------- Layar login ---------------- */
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => string | null }) {
  const now = useNow();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const month = now.getMonth();
  const semester = month >= 6 ? "Ganjil" : "Genap";
  const ay = month >= 6 ? `${now.getFullYear()}/${now.getFullYear() + 1}` : `${now.getFullYear() - 1}/${now.getFullYear()}`;
  const start = new Date(now.getFullYear(), 6, 14).getTime();
  const dayNo = Math.max(1, Math.floor((now.getTime() - start) / 864e5) + 1);
  const TICKER = `Cittclass · Learning Management System · Panel Admin · SMK Negeri 2 Nusantara · Tahun Ajaran ${ay} · `;

  const submit = (e: FormEvent) => { e.preventDefault(); setErr(onLogin(email, pass)); };

  return (
    <div className="cc-login">
      <div className="cc-login-left">
        <div className="cc-login-brand">
          <span className="cc-mark">C</span>
          <strong>Citt<em>class</em></strong>
          <span>Panel Admin</span>
        </div>
        <div className="cc-login-clock">
          <p className="cc-login-time">{pad2(now.getHours())}:{pad2(now.getMinutes())}<small>:{pad2(now.getSeconds())}</small></p>
          <p className="cc-login-date">{now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="cc-login-day">Hari sekolah ke-{dayNo} · Semester {semester} · TA {ay}</p>
        </div>
        <p className="cc-login-quote">
          &ldquo;Satu pintu untuk mengelola akun, jurusan, guru, dan seluruh aktivitas pembelajaran —
          agar sekolah berjalan tertib seperti buku induk yang rapi.&rdquo;
        </p>
        <div className="cc-marquee">
          <div className="cc-marquee-track"><span>{TICKER}</span><span aria-hidden="true">{TICKER}</span></div>
        </div>
      </div>

      <div className="cc-login-right">
        <form className="cc-login-form" onSubmit={submit} noValidate>
          <p className="cc-kicker">Masuk · Area Terbatas</p>
          <h1>Panel <em>Admin</em> Cittclass</h1>
          <p className="cc-login-sub">Kelola akun sekolah, jurusan, guru, dan pantau seluruh aktivitas dari satu tempat.</p>

          {err && <div className="cc-err"><Icon name="info" size={15} /><span>{err}</span></div>}

          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-email">Email</label>
            <input id="cc-email" className="cc-input" type="email" placeholder="admin@cittclass.sch.id"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-pass">Kata sandi</label>
            <div className="cc-pass">
              <input id="cc-pass" className="cc-input" type={show ? "text" : "password"} placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}>
                <Icon name={show ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
          </div>

          <button type="submit" className="cc-btn cc-btn-primary"
            style={{ width: "100%", marginTop: 6, justifyContent: "center", padding: "12px 17px" }}>
            Masuk ke Panel <Icon name="arrowRight" size={16} />
          </button>

          <div className="cc-demo">
            <span>Demo — <b>admin@cittclass.sch.id</b> / <b>admin123</b></span>
            <button type="button" onClick={() => { setEmail("admin@cittclass.sch.id"); setPass("admin123"); setErr(null); }}>Isi otomatis</button>
          </div>
          <p className="cc-login-foot">Cittclass LMS · Seluruh aktivitas administrator tercatat otomatis.</p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Metadata halaman ---------------- */
const NAV: { key: PageKey; no: string; label: string; icon: string }[] = [
  { key: "home", no: "01", label: "Beranda", icon: "home" },
  { key: "accounts", no: "02", label: "Kelola Akun", icon: "users" },
  { key: "classes", no: "03", label: "Manajemen Kelas", icon: "layers" },
  { key: "majors", no: "04", label: "Jurusan & Siswa", icon: "layers" },
  { key: "teachers", no: "05", label: "Guru & Mapel", icon: "book" },
  { key: "activity", no: "06", label: "Aktivitas", icon: "activity" },
];
const PAGE_META: Record<PageKey, { crumb: string; title: ReactNode }> = {
  home: { crumb: "Beranda", title: <>Beranda <em>Admin</em></> },
  accounts: { crumb: "Kelola Akun", title: <>Kelola <em>Akun</em></> },
  classes: { crumb: "Manajemen Kelas", title: <>Manajemen <em>Kelas</em></> },
  majors: { crumb: "Jurusan & Siswa", title: <>Jurusan &amp; <em>Siswa</em></> },
  teachers: { crumb: "Guru & Mapel", title: <>Guru &amp; <em>Mata Pelajaran</em></> },
  activity: { crumb: "Aktivitas", title: <>Aktivitas <em>Terbaru</em></> },
};

/* ================= Komponen utama ================= */
export default function CittclassAdmin() {
  const [ready, setReady] = useState(false);
  const [db, setDb] = useState<DB | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [page, setPage] = useState<PageKey>("home");
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* Muat "database" & sesi dari localStorage saat pertama kali */
  useEffect(() => {
    let d: DB | null = null;
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) d = JSON.parse(raw) as DB;
    } catch { d = null; }
    if (!d || !Array.isArray(d.users) || d.users.length === 0) d = makeSeed();
    else if (!Array.isArray(d.classes)) d.classes = makeSeed().classes;
    setDb(d);
    try {
      const s = localStorage.getItem(SESSION_KEY);
      const demoRole = localStorage.getItem("cittclass_demo_role");
      if (s && d.users.some(u => u.id === s && u.role === "admin" && u.status === "aktif")) setSessionId(s);
      else if (demoRole === "admin") {
        const admin = d.users.find(u => u.role === "admin" && u.status === "aktif");
        if (admin) { setSessionId(admin.id); localStorage.setItem(SESSION_KEY, admin.id); }
      }
    } catch { /* abaikan */ }
    setReady(true);
  }, []);

  /* Simpan setiap perubahan */
  useEffect(() => {
    if (ready && db) { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* abaikan */ } }
  }, [db, ready]);

  const toast = (msg: string, type: "ok" | "err" = "ok") => {
    const id = uid("t");
    setToasts(ts => [...ts.slice(-3), { id, msg, type }]);
    window.setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3400);
  };

  const pushActivity = (kind: ActivityKind, action: string, target?: string, actor = "Administrator") => {
    setDb(prev => prev
      ? { ...prev, activities: [{ id: uid("a"), ts: Date.now(), kind, action, target, actor }, ...prev.activities].slice(0, 250) }
      : prev);
  };

  const sessionUser = db && sessionId ? db.users.find(u => u.id === sessionId && u.role === "admin" && u.status === "aktif") : undefined;
  const actorName = sessionUser?.name ?? "Administrator";

  /* ---------- Autentikasi ---------- */
  function attemptLogin(email: string, password: string): string | null {
    if (!db) return "Database belum siap, coba muat ulang.";
    const u = db.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) return "Email atau kata sandi tidak cocok.";
    if (u.role !== "admin") return `Akun ini terdaftar sebagai ${ROLE_LABEL[u.role]}. Hanya admin yang dapat membuka panel ini.`;
    if (u.status !== "aktif") return "Akun ini sedang dinonaktifkan. Hubungi administrator lain.";
    setSessionId(u.id);
    try { localStorage.setItem(SESSION_KEY, u.id); } catch { /* abaikan */ }
    pushActivity("sesi", "Masuk ke panel admin", undefined, u.name);
    toast(`Selamat datang kembali, ${u.name.split(" ")[0]}.`);
    setPage("home");
    return null;
  }
  function logout() {
    pushActivity("sesi", "Keluar dari panel admin", undefined, actorName);
    setSessionId(null);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* abaikan */ }
    try { localStorage.removeItem("cittclass_demo_role"); } catch { /* abaikan */ }
    setPage("home");
  }

  /* ---------- CRUD akun ---------- */
  function saveUser(form: UserFormState, editingId: string | null): string | null {
    if (!db) return null;
    const email = form.email.trim().toLowerCase();
    if (db.users.some(u => u.email.toLowerCase() === email && u.id !== editingId)) return "Email sudah dipakai akun lain.";
    const common = {
      name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role, status: form.status,
      nis: form.nis.trim() || undefined, nip: form.nip.trim() || undefined,
      jurusanId: form.role === "siswa" ? (form.jurusanId || undefined) : undefined,
      kelas: form.role === "siswa" ? (form.kelas.trim() || undefined) : undefined,
    };
    if (editingId) {
      setDb(prev => !prev ? prev : {
        ...prev,
        users: prev.users.map(u => u.id === editingId
          ? { ...u, ...common, subjects: form.role === "guru" ? (u.subjects ?? []) : undefined }
          : u),
      });
      pushActivity("akun", "Memperbarui akun", form.name.trim(), actorName);
      toast(`Akun ${form.name.trim()} diperbarui.`);
    } else {
      const nu: User = { id: uid("u"), createdAt: Date.now(), ...common, subjects: form.role === "guru" ? [] : undefined };
      setDb(prev => prev ? { ...prev, users: [nu, ...prev.users] } : prev);
      pushActivity("akun", `Menambahkan akun ${ROLE_LABEL[form.role].toLowerCase()}`, nu.name, actorName);
      toast(`Akun ${nu.name} berhasil dibuat.`);
    }
    return null;
  }
  function deleteUser(id: string) {
    if (!db) return;
    const u = db.users.find(x => x.id === id);
    if (!u) return;
    if (u.id === sessionId) { toast("Anda tidak dapat menghapus akun yang sedang digunakan.", "err"); return; }
    setDb(prev => prev ? { ...prev, users: prev.users.map(x => x.id === id ? { ...x, status: "nonaktif" } : x) } : prev);
    pushActivity("akun", `Menonaktifkan akun ${ROLE_LABEL[u.role].toLowerCase()}`, u.name, actorName);
    toast(`Akun ${u.name} dinonaktifkan.`);
  }

  /* ---------- CRUD jurusan ---------- */
  function saveMajor(data: { code: string; name: string; desc: string }, editingId: string | null): string | null {
    if (!db) return null;
    const code = data.code.trim().toUpperCase();
    const name = data.name.trim();
    if (db.majors.some(m => m.code.toUpperCase() === code && m.id !== editingId)) return "Kode jurusan sudah dipakai.";
    if (editingId) {
      setDb(prev => prev ? { ...prev, majors: prev.majors.map(m => m.id === editingId ? { ...m, code, name, desc: data.desc.trim() } : m) } : prev);
      pushActivity("jurusan", "Memperbarui jurusan", name, actorName);
      toast(`Jurusan ${name} diperbarui.`);
    } else {
      const m: Major = { id: uid("mj"), code, name, desc: data.desc.trim() };
      setDb(prev => prev ? { ...prev, majors: [...prev.majors, m] } : prev);
      pushActivity("jurusan", "Menambahkan jurusan", m.name, actorName);
      toast(`Jurusan ${m.name} ditambahkan.`);
    }
    return null;
  }
  function deleteMajor(id: string) {
    if (!db) return;
    const m = db.majors.find(x => x.id === id);
    if (!m) return;
    const affected = db.users.filter(u => u.jurusanId === id).length;
    setDb(prev => prev
      ? {
        ...prev,
        majors: prev.majors.filter(x => x.id !== id),
        users: prev.users.map(u => u.jurusanId === id ? { ...u, jurusanId: undefined } : u),
      }
      : prev);
    pushActivity("jurusan", "Menghapus jurusan", m.name, actorName);
    toast(`Jurusan ${m.name} dihapus.${affected ? ` ${affected} siswa dilepas dari jurusan.` : ""}`);
  }

  function saveClass(data: Omit<SchoolClass, "id">, editingId: string | null): string | null {
    if (!db) return null;
    const name = data.name.trim();
    if (db.classes.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId)) return "Nama kelas sudah digunakan.";
    if (editingId) {
      setDb(prev => prev ? { ...prev, classes: prev.classes.map(c => c.id === editingId ? { ...c, ...data, name } : c) } : prev);
      pushActivity("kelas", "Memperbarui data kelas", name, actorName);
      toast(`Kelas ${name} diperbarui.`);
    } else {
      const classroom: SchoolClass = { id: uid("cl"), ...data, name };
      setDb(prev => prev ? { ...prev, classes: [...prev.classes, classroom] } : prev);
      pushActivity("kelas", "Menambahkan kelas", name, actorName);
      toast(`Kelas ${name} ditambahkan.`);
    }
    return null;
  }
  function deactivateClass(id: string) {
    const classroom = db?.classes.find(c => c.id === id);
    if (!classroom || !db) return;
    setDb(prev => prev ? { ...prev, classes: prev.classes.map(c => c.id === id ? { ...c, status: "nonaktif" } : c) } : prev);
    pushActivity("kelas", "Menonaktifkan kelas", classroom.name, actorName);
    toast(`Kelas ${classroom.name} dinonaktifkan.`);
  }

  /* ---------- Mapel guru ---------- */
  function setSubjects(teacherId: string, subjects: string[], logAction?: string) {
    if (!db) return;
    const t = db.users.find(u => u.id === teacherId);
    if (!t) return;
    setDb(prev => prev ? { ...prev, users: prev.users.map(u => u.id === teacherId ? { ...u, subjects } : u) } : prev);
    if (logAction) pushActivity("mapel", logAction, t.name, actorName);
  }
  function clearActivities() {
    setDb(prev => prev ? { ...prev, activities: [] } : prev);
    toast("Riwayat aktivitas dibersihkan.");
  }

  /* ---------- Render ---------- */
  const frame = (node: ReactNode) => (
    <div id="cc-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {node}
    </div>
  );

  if (!ready || !db) {
    return frame(
      <div className="cc-splash">
        <span className="cc-mark">C</span>
        <p className="mono" style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-soft)" }}>Memuat panel…</p>
      </div>
    );
  }

  if (!sessionUser) {
    return frame(<LoginScreen onLogin={attemptLogin} />);
  }

  const todayCount = db.activities.filter(a => new Date(a.ts).toDateString() === new Date().toDateString()).length;
  const adminFirstName = sessionUser.name.split(" ")[0];

  return frame(
    <div className="cc-app">
      <aside className="cc-side">
        <div className="cc-side-brand">
          <span className="cc-mark">C</span>
          <div><strong>Citt<em>class</em></strong><small>Panel Admin</small></div>
        </div>
        <nav className="cc-nav">
          <span className="cc-nav-label">Menu Utama</span>
          {NAV.map(n => (
            <button key={n.key} className={`cc-nav-item${page === n.key ? " on" : ""}`} onClick={() => setPage(n.key)}>
              <span className="cc-no">{n.no}</span>
              <Icon name={n.icon} size={16} />
              <span>{n.label}</span>
              {n.key === "activity" && todayCount > 0 ? <span className="cc-nav-count">{todayCount}</span> : null}
            </button>
          ))}
        </nav>
        <div className="cc-side-user">
          <Avatar user={sessionUser} size={38} />
          <div className="cc-who"><b>{sessionUser.name}</b><span>Administrator</span></div>
          <button className="cc-side-exit" onClick={logout} title="Keluar" aria-label="Keluar"><Icon name="logout" size={16} /></button>
        </div>
      </aside>

      <div className="cc-main">
        <header className="cc-topbar">
          <div>
            <p className="cc-crumb">Admin / {PAGE_META[page].crumb}</p>
            <h2>{PAGE_META[page].title}</h2>
          </div>
          <TopClock />
        </header>
        <main className="cc-content" key={page}>
          {page === "home" && <PageHome db={db} adminName={adminFirstName} goto={setPage} />}
          {page === "accounts" && (
            <PageAccounts users={db.users} majors={db.majors} currentUserId={sessionUser.id}
              onSave={saveUser} onDelete={deleteUser} />
          )}
          {page === "classes" && <PageClasses classes={db.classes} majors={db.majors} users={db.users} onSave={saveClass} onDeactivate={deactivateClass} />}
          {page === "majors" && (
            <PageMajors majors={db.majors} users={db.users}
              onSaveMajor={saveMajor} onDeleteMajor={deleteMajor}
              onSaveUser={saveUser} onDeleteUser={deleteUser} />
          )}
          {page === "teachers" && (
            <PageTeachers users={db.users} majors={db.majors}
              onSave={saveUser} onDelete={deleteUser} onSetSubjects={setSubjects} toast={toast} />
          )}
          {page === "activity" && <PageActivity activities={db.activities} onClear={clearActivities} />}
        </main>
      </div>

      <ToastHost toasts={toasts} />
    </div>
  );
}

function TopClock() {
  const now = useNow();
  return (
    <div className="cc-clock">
      <b>{pad2(now.getHours())}:{pad2(now.getMinutes())}</b>
      {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
    </div>
  );
}
