"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PerformaInvoiceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/invoice");
  }, [router]);

  return null;
}
