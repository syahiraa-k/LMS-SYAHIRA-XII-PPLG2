import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, GraduationCap, Play, Sparkles } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Materi terpusat", text: "Akses materi dan sumber belajar dari setiap mata pelajaran dalam satu ruang." },
  { icon: Play, title: "Video pembelajaran", text: "Pelajari kembali topik penting lewat video yang bisa dibuka kapan saja." },
  { icon: ClipboardCheck, title: "Quiz dan latihan", text: "Uji pemahaman dan ikuti progres belajarmu dengan lebih terarah." },
];

export default function LandingPage() {
  return <main className="public-page">
    <nav className="public-nav shell">
      <Link className="brand" href="/"><span className="brand-mark">C</span><span>Citt<span className="brand-blue">Class</span></span></Link>
      <div className="nav-links"><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a></div>
      <Link className="button button-outline nav-login" href="/login">Masuk <ArrowRight size={16}/></Link>
    </nav>
    <section className="hero shell">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={15}/> RUANG BELAJAR DIGITAL SEKOLAH</span>
        <h1>Belajar lebih mudah bersama <span>CittClass.</span></h1>
        <p className="hero-lead">Semua yang dibutuhkan untuk belajar dan mengajar, hadir dalam satu platform yang sederhana dan mudah digunakan.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/login">Mulai belajar <ArrowRight size={17}/></Link><a className="button button-quiet" href="#fitur">Kenali fiturnya</a></div>
        <div className="hero-note"><span className="avatar-stack"><i>G</i><i>S</i><i>A</i></span><span>Untuk guru, siswa, dan seluruh warga sekolah</span></div>
      </div>
      <div className="hero-art" aria-label="Ilustrasi ruang belajar digital">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
        <div className="art-book"><div className="book-cover"><span className="book-spark">✳</span><small>RUANG BELAJAR</small><b>Terus<br/>bertumbuh.</b><div className="book-lines"><i/><i/><i/></div></div><div className="book-pages"/></div>
        <div className="floating-card lesson-card"><span className="float-icon blue-icon"><BookOpen size={18}/></span><span><b>Materi baru</b><small>Dasar Pemrograman Web</small></span><span className="live-dot"/></div>
        <div className="floating-card progress-card"><span className="progress-ring">82%</span><span><b>Progres belajar</b><small>Terus pertahankan!</small></span></div>
        <div className="art-caption"><GraduationCap size={16}/> Satu langkah kecil setiap hari.</div>
      </div>
    </section>
    <section className="stats-band"><div className="shell stats-grid"><div><b>200+</b><span>Materi belajar</span></div><div><b>105+</b><span>Video pembelajaran</span></div><div><b>78+</b><span>Quiz interaktif</span></div><div><b>355+</b><span>Siswa aktif</span></div></div><p className="stats-note">Angka ilustrasi untuk pratinjau. Data aktual akan mengikuti database sekolah.</p></section>
    <section className="section shell" id="fitur"><div className="section-heading"><span className="eyebrow">BELAJAR DALAM SATU RUANG</span><h2>Semua proses belajar,<br/><span>lebih terarah.</span></h2><p>Temukan materi, pahami pelajaran, dan lihat perkembanganmu tanpa berpindah-pindah tempat.</p></div><div className="feature-grid">{features.map(({icon: Icon,title,text},i)=><article className="feature-card" key={title}><span className={`feature-icon feature-${i}`}><Icon size={21}/></span><h3>{title}</h3><p>{text}</p><span className="feature-number">0{i+1}</span></article>)}</div></section>
    <section className="how-section" id="cara-kerja"><div className="shell how-inner"><div><span className="eyebrow">MULAI DARI SINI</span><h2>Belajar jadi lebih<br/><span>mudah dijalani.</span></h2><p>Masuk menggunakan akun sekolahmu, lalu lanjutkan kegiatan belajar dari dashboard pribadi.</p><Link className="button button-primary" href="/login">Masuk ke CittClass <ArrowRight size={17}/></Link></div><div className="steps">{[["01","Login dengan akun sekolah"],["02","Pilih mata pelajaran"],["03","Belajar dan kerjakan quiz"]].map(([n,t])=><div className="step" key={n}><span>{n}</span><b>{t}</b><ArrowRight size={17}/></div>)}</div></div></section>
    <footer className="public-footer"><div className="shell footer-inner"><Link className="brand" href="/"><span className="brand-mark">C</span><span>Citt<span className="brand-blue">Class</span></span></Link><span>Platform pembelajaran digital sekolah.</span><span>© {new Date().getFullYear()} CittClass</span></div></footer>
  </main>;
}
