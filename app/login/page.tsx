"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, Eye, EyeOff, GraduationCap, Landmark, ShieldCheck, UserRound, UsersRound } from "lucide-react";

const roles = [
  { id: "admin", title: "Admin", icon: ShieldCheck, description: "Kelola data sekolah" },
  { id: "guru", title: "Guru", icon: BookOpen, description: "Atur pembelajaran" },
  { id: "siswa", title: "Siswa", icon: GraduationCap, description: "Ikuti kegiatan belajar" },
  { id: "kepsek", title: "Kepala Sekolah", icon: Landmark, description: "Pantau aktivitas sekolah" },
  { id: "kurikulum", title: "Kurikulum", icon: UsersRound, description: "Monitor kegiatan akademik" },
];
const demos: Record<string, { email: string; password: string }> = {
  admin: { email: "admin@cittclass.sch.id", password: "admin123" },
  guru: { email: "hendra.gunawan@cittclass.sch.id", password: "guru123" },
  siswa: { email: "aisyah.putri@siswa.cittclass.sch.id", password: "siswa123" },
  kepsek: { email: "suryana.hadi@cittclass.sch.id", password: "kepsek123" },
  kurikulum: { email: "nurul.hidayati@cittclass.sch.id", password: "kurikulum123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("guru");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fillDemo = () => { setEmail(demos[role].email); setPassword(demos[role].password); setError(""); setNotice(""); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setNotice("");
    const demo = demos[role];
    if (email.trim().toLowerCase() !== demo.email || password !== demo.password) { setError("Email atau kata sandi demo tidak cocok dengan role yang dipilih."); return; }
    localStorage.setItem("cittclass_demo_role", role);
    localStorage.setItem("cittclass_demo_name", roles.find(item => item.id === role)?.title ?? "Pengguna");
    if (role !== "admin") localStorage.removeItem("cittclass_session_v1");
    if (role === "admin") router.push("/admin");
    else if (role === "guru") router.push("/guru");
    else setNotice(`Login demo ${roles.find(item => item.id === role)?.title} berhasil. Panel role ini akan dibuat pada tahap berikutnya.`);
  };

  return <main className="login-page"><div className="login-aside"><Link className="brand brand-light" href="/"><span className="brand-mark">C</span><span>Citt<span>Class</span></span></Link><div className="login-aside-copy"><span className="eyebrow eyebrow-light">SATU RUANG UNTUK BELAJAR</span><h1>Hari ini belajar,<br/><i>esok bertumbuh.</i></h1><p>Masuk ke ruang belajar digital CittClass menggunakan akun sekolahmu.</p></div><div className="aside-note"><span><BookOpen size={17}/></span><div><b>Belajar dalam satu tempat</b><small>Materi, latihan, dan aktivitas kelasmu.</small></div></div><div className="aside-decoration"><i/><i/><i/></div><span className="aside-bottom">CITCLASS LEARNING PLATFORM · 2026</span></div>
    <section className="login-content"><Link href="/" className="back-link"><ArrowLeft size={16}/> Kembali ke beranda</Link><div className="login-form-wrap"><span className="eyebrow">SELAMAT DATANG KEMBALI</span><h2>Masuk ke <span>CittClass</span></h2><p className="login-intro">Pilih peran dan masukkan akun sekolah untuk melanjutkan.</p>
      <div className="role-grid" aria-label="Pilih peran">{roles.map(({id,title,icon:Icon,description})=><button type="button" key={id} onClick={()=>{setRole(id);setError("");setNotice("");}} className={`role-option${role===id?" selected":""}`} aria-pressed={role===id}><span className="role-icon"><Icon size={18}/></span><span className="role-copy"><b>{title}</b><small>{description}</small></span>{role===id&&<span className="role-check"><Check size={13}/></span>}</button>)}</div>
      <form onSubmit={submit} className="login-form"><label htmlFor="login-email">Email sekolah</label><input id="login-email" type="email" placeholder="nama@sekolah.sch.id" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/><label htmlFor="login-password">Kata sandi</label><div className="password-field"><input id="login-password" type={showPassword?"text":"password"} placeholder="Masukkan kata sandi" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/><button type="button" aria-label={showPassword?"Sembunyikan kata sandi":"Tampilkan kata sandi"} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{error&&<p className="form-feedback form-error" role="alert">{error}</p>}{notice&&<p className="form-feedback form-success" role="status">{notice}</p>}<button className="button button-primary login-submit" type="submit">Masuk sebagai {roles.find(item=>item.id===role)?.title}<ArrowRight size={17}/></button></form>
      <button type="button" className="demo-fill" onClick={fillDemo}><UserRound size={15}/> Isi akun demo <span>{roles.find(item=>item.id===role)?.title}</span></button><p className="login-security"><ShieldCheck size={15}/> Pratinjau frontend. Backend tetap harus memvalidasi role dan hak akses.</p>
    </div><p className="login-copyright">© {new Date().getFullYear()} CittClass · Learning Management System</p></section></main>;
}
