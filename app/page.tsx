"use client";

import { useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#f5f7fa]">

      {/* TOP LINE */}
      <div className="fixed left-0 top-0 z-50 h-[4px] w-full bg-[#ff00ff]" />

      <div className="flex min-h-screen">

        {/* ================= LEFT SIDE ================= */}
        <section className="relative hidden w-1/2 overflow-hidden bg-[#4b43df] lg:flex">

          <div className="flex w-full flex-col items-center justify-center px-16">

            {/* TEXT */}
            <div className="mb-8 text-center text-white">

              <h1 className="text-[23px] font-bold tracking-tight">
                Learn. Manage. Grow.
              </h1>

              <p className="mt-2 max-w-[310px] text-[11px] leading-relaxed text-white/70">
                One platform for students, teachers, administrators, and
                school management.
              </p>

            </div>

            {/* ILLUSTRATION */}
            <div className="w-[440px] max-w-full overflow-hidden rounded-lg bg-white p-2 shadow-xl">
              <img
                src="/login-illustration.png"
                alt="CittClass illustration"
                className="h-auto w-full rounded-md object-cover"
              />
            </div>

          </div>
        </section>

        {/* ================= RIGHT SIDE ================= */}
        <section className="flex w-full flex-col lg:w-1/2">

          {/* LOGIN AREA */}
          <div className="flex flex-1 items-center justify-center px-6 py-16">

            <div className="w-full max-w-[390px]">

              {/* LOGIN CARD */}
              <div className="rounded-lg border border-[#e3e5eb] bg-white px-5 py-7 shadow-[0_4px_15px_rgba(0,0,0,0.06)]">

                {/* TITLE */}
                <div className="mb-7 text-center">

                  <h2 className="text-[17px] font-bold text-[#171717]">
                    Welcome Back!
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Please enter your account details to sign in.
                  </p>

                </div>

                {/* EMAIL / USERNAME */}
                <div className="mb-5">

                  <label className="mb-1.5 block text-[9px] font-semibold text-[#292929]">
                    Username or NISN
                  </label>

                  <div className="flex h-[38px] items-center rounded-md border border-[#d9dce5] px-2.5 transition focus-within:border-[#4b43df]">

                    <Mail
                      size={14}
                      className="mr-2 text-[#7b7e89]"
                    />

                    <input
                      type="text"
                      placeholder="Enter your username or NISN"
                      className="w-full bg-transparent text-[10px] text-gray-700 outline-none placeholder:text-[#a5a7ae]"
                    />

                  </div>

                </div>

                {/* PASSWORD */}
                <div className="mb-2">

                  <label className="mb-1.5 block text-[9px] font-semibold text-[#292929]">
                    Password
                  </label>

                  <div className="flex h-[38px] items-center rounded-md border border-[#d9dce5] px-2.5 transition focus-within:border-[#4b43df]">

                    <LockKeyhole
                      size={14}
                      className="mr-2 text-[#7b7e89]"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-[10px] text-gray-700 outline-none placeholder:text-[#a5a7ae]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="text-[#858894] hover:text-[#4b43df]"
                    >
                      {showPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>

                  </div>

                </div>

                {/* REMEMBER + FORGOT */}
                <div className="mb-6 flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-1.5">

                    <input
                      type="checkbox"
                      className="h-[10px] w-[10px] accent-[#4b43df]"
                    />

                    <span className="text-[8px] text-[#656771]">
                      Remember me
                    </span>

                  </label>

                  <button
                    type="button"
                    className="text-[8px] font-medium text-[#4b43df] hover:underline"
                  >
                    Forgot password?
                  </button>

                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="button"
                  className="h-[38px] w-full rounded-md bg-[#4b43df] text-[10px] font-medium text-white transition hover:bg-[#4038d1] active:scale-[0.99]"
                >
                  Login
                </button>

              </div>

            </div>

          </div>

          {/* COPYRIGHT */}
          <footer className="pb-5 text-center">

            <p className="text-[8px] text-[#777982]">
              © 2024 CittClass. All rights reserved.
            </p>

          </footer>

        </section>

      </div>
    </main>
  );
}