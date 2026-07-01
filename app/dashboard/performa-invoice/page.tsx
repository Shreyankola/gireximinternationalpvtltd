"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Header from "@/components/Header";
import PerformaInvoiceForm from "@/components/PerformaInvoiceForm";

export default function PerformaInvoicePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setLoaded(true);
  }, [router]);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Proforma Invoice Generator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details or use the default data. Choose Word format to generate.
          </p>
        </div>
        <PerformaInvoiceForm />
      </main>
    </div>
  );
}
