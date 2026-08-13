"use client";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  UserPlus,
  ClipboardList,
  Settings,
  LogOut,
  Bell,
  Search,
  MoreVertical,
  TrendingUp,
  UserRoundCheck,
  UserRoundCog,
} from "lucide-react";

const stats = [
  {
    title: "Total Siswa",
    value: "1,248",
    change: "+12.5%",
    icon: Users,
  },
  {
    title: "Total Guru",
    value: "86",
    change: "+5.2%",
    icon: GraduationCap,
  },
  {
    title: "Total Kelas",
    value: "42",
    change: "+3.1%",
    icon: School,
  },
  {
    title: "Total Jurusan",
    value: "6",
    change: "+1.8%",
    icon: BookOpen,
  },
];

const activities = [
  {
    name: "Andi Pratama",
    action: "Menambahkan akun siswa baru",
    time: "5 menit yang lalu",
    icon: UserPlus,
  },
  {
    name: "Siti Rahma",
    action: "Mengubah data kelas XI PPLG 1",
    time: "20 menit yang lalu",
    icon: ClipboardList,
  },
  {
    name: "Budi Santoso",
    action: "Menambahkan mata pelajaran",
    time: "1 jam yang lalu",
    icon: BookOpen,
  },
  {
    name: "Admin",
    action: "Mengubah pengaturan sistem",
    time: "2 jam yang lalu",
    icon: Settings,
  },
];

const quickMenus = [
  {
    title: "Tambah Siswa",
    description: "Buat akun siswa baru",
    icon: UserPlus,
  },
  {
    title: "Data Guru",
    description: "Kelola data guru",
    icon: UserRoundCog,
  },
  {
    title: "Data Kelas",
    description: "Kelola kelas sekolah",
    icon: School,
  },
  {
    title: "Data Jurusan",
    description: "Kelola jurusan",
    icon: BookOpen,
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-950 text-white">

          {/* LOGO */}
          <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              CC
            </div>

            <div>
              <h1 className="text-lg font-bold">CittClass</h1>
              <p className="text-xs text-slate-400">
                Learning Management
              </p>
            </div>
          </div>

          {/* MENU */}
          <nav className="flex-1 space-y-2 px-4 py-6">

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Main Menu
            </p>

            <SidebarItem
              icon={LayoutDashboard}
              title="Dashboard"
              active
            />

            <SidebarItem
              icon={Users}
              title="Data Siswa"
            />

            <SidebarItem
              icon={GraduationCap}
              title="Data Guru"
            />

            <SidebarItem
              icon={School}
              title="Kelas"
            />

            <SidebarItem
              icon={BookOpen}
              title="Jurusan"
            />

            <SidebarItem
              icon={ClipboardList}
              title="Mata Pelajaran"
            />

            <div className="my-5 border-t border-slate-800" />

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              System
            </p>

            <SidebarItem
              icon={Settings}
              title="Pengaturan"
            />
          </nav>

          {/* ADMIN PROFILE */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
                A
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold">
                  Administrator
                </p>
                <p className="truncate text-xs text-slate-400">
                  admin@cittclass.id
                </p>
              </div>

              <button className="text-slate-400 hover:text-white">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="ml-64 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Dashboard
              </h2>

              <p className="text-sm text-slate-500">
                Selamat datang kembali, Administrator.
              </p>
            </div>

            <div className="flex items-center gap-4">

              {/* SEARCH */}
              <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 md:flex">
                <Search size={18} className="text-slate-400" />

                <input
                  type="text"
                  placeholder="Cari sesuatu..."
                  className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              {/* NOTIFICATION */}
              <button className="relative rounded-xl p-2 hover:bg-slate-100">
                <Bell size={21} />

                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              </button>

              {/* PROFILE */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                A
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="space-y-8 p-8">

            {/* STATISTICS */}
            <section>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Overview
                </h3>

                <p className="text-sm text-slate-500">
                  Ringkasan data sekolah
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">

                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            {stat.title}
                          </p>

                          <h4 className="mt-2 text-3xl font-bold text-slate-900">
                            {stat.value}
                          </h4>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Icon size={22} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <TrendingUp size={14} />
                          {stat.change}
                        </span>

                        <span className="text-xs text-slate-400">
                          dari bulan lalu
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </section>

            {/* QUICK MENU */}
            <section>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Quick Menu
                </h3>

                <p className="text-sm text-slate-500">
                  Akses cepat untuk mengelola sistem
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {quickMenus.map((menu) => {
                  const Icon = menu.icon;

                  return (
                    <button
                      key={menu.title}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon size={21} />
                      </div>

                      <h4 className="font-semibold text-slate-900">
                        {menu.title}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {menu.description}
                      </p>
                    </button>
                  );
                })}

              </div>
            </section>

            {/* BOTTOM CONTENT */}
            <section className="grid gap-6 xl:grid-cols-3">

              {/* ACTIVITY */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

                <div className="flex items-center justify-between border-b border-slate-200 p-6">

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Aktivitas Terbaru
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Aktivitas user terbaru dalam sistem
                    </p>
                  </div>

                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Lihat Semua
                  </button>
                </div>

                <div className="divide-y divide-slate-100">

                  {activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.name + activity.time}
                        className="flex items-center gap-4 p-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <Icon size={18} />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-slate-900">
                              {activity.name}
                            </span>{" "}
                            <span className="text-slate-500">
                              {activity.action}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {activity.time}
                          </p>
                        </div>

                        <button className="text-slate-400 hover:text-slate-700">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* SUMMARY */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">
                  <h3 className="font-bold text-slate-900">
                    Ringkasan Pengguna
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribusi pengguna sistem
                  </p>
                </div>

                <div className="space-y-5">

                  <ProgressItem
                    title="Siswa"
                    value="1,248"
                    percentage={82}
                  />

                  <ProgressItem
                    title="Guru"
                    value="86"
                    percentage={45}
                  />

                  <ProgressItem
                    title="Administrator"
                    value="8"
                    percentage={15}
                  />

                  <ProgressItem
                    title="Kepala Sekolah"
                    value="1"
                    percentage={5}
                  />

                </div>

                <div className="mt-8 rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      <UserRoundCheck size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Total Pengguna
                      </p>

                      <p className="text-xs text-slate-500">
                        1,343 akun terdaftar
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

/* SIDEBAR ITEM */

function SidebarItem({
  icon: Icon,
  title,
  active = false,
}: {
  icon: React.ElementType;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
      }`}
    >
      <Icon size={19} />
      <span>{title}</span>
    </button>
  );
}

/* PROGRESS ITEM */

function ProgressItem({
  title,
  value,
  percentage,
}: {
  title: string;
  value: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {title}
        </span>

        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}