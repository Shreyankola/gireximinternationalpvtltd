"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import Image from "next/image";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Image
              src="/GIREXIM_LOGO_SORT.png"
              alt="GIREXIM Logo"
              width={140}
              height={50}
              className="object-contain h-8 sm:h-10 w-auto"
              priority
            />
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                GIREXIM INTERNATIONAL
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 -mt-0.5">
                PRIVATE LIMITED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-orange-50 text-orange-600 text-xs font-medium border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              Containers
            </button>
            <button
              onClick={() => router.push("/dashboard/invoice")}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              Invoice
            </button>
            <button
              onClick={() => router.push("/dashboard/packing-list")}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-50 text-green-600 text-xs font-medium border border-green-100 hover:bg-green-100 transition-colors"
            >
              Packing List
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
