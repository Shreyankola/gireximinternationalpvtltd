"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getContainers, saveContainer, deleteContainer, searchContainers } from "@/lib/storage";
import { ContainerRecord } from "@/types";
import { TimeQuarter02Icon } from "hugeicons-react";
import Header from "@/components/Header";
import ContainerCard from "@/components/ContainerCard";
import ContainerModal from "@/components/ContainerModal";
import Toast from "@/components/Toast";

type SortBy = "updated" | "oldest" | "newest" | "az" | "za";

export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ContainerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ContainerRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadRecords();
  }, [router]);

  async function loadRecords() {
    setLoading(true);
    try {
      const data = await getContainers();
      setRecords(data);
    } catch {
      setToast({ message: "Failed to load containers.", type: "error" });
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = records;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.blNo.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "newest":
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "az":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return sorted;
  }, [records, search, sortBy]);

  const handleSave = useCallback(
    async (data: { blNo: string; title: string; description: string; containerCount: string }) => {
      try {
        if (editRecord) {
          const updated: ContainerRecord = {
            ...editRecord,
            ...data,
            updatedAt: Date.now(),
          };
          await saveContainer(updated);
          setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setToast({ message: "Container updated successfully.", type: "success" });
        } else {
          const newRecord: ContainerRecord = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await saveContainer(newRecord);
          setRecords((prev) => [...prev, newRecord]);
          setToast({ message: "Container created successfully.", type: "success" });
        }
        setModalOpen(false);
        setEditRecord(null);
      } catch {
        setToast({ message: "Failed to save container.", type: "error" });
      }
    },
    [editRecord]
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteContainer(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setToast({ message: "Container deleted.", type: "success" });
    } catch {
      setToast({ message: "Failed to delete container.", type: "error" });
    }
  }, []);

  const handleEdit = useCallback((record: ContainerRecord) => {
    setEditRecord(record);
    setModalOpen(true);
  }, []);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Container Information</h2>
          <button
            onClick={() => { setEditRecord(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-300 hover:bg-orange-400 transition-colors shadow-sm self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Container
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-400 rounded-full animate-spin" />
          </div>
        ) : records.length > 0 ? (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by BL No. or Title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors bg-white"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full sm:w-auto appearance-none pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors cursor-pointer"
              >
                <option value="updated">Latest Updated</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
              </select>
              <TimeQuarter02Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : null}

        {!loading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-24 h-24 text-gray-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Containers Yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Click the &quot;New Container&quot; button to add your first container record.
            </p>
          </div>
        ) : !loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-gray-400">No results found for &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((record) => (
              <ContainerCard
                key={record.id}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <ContainerModal
        isOpen={modalOpen}
        record={editRecord}
        onSave={handleSave}
        onClose={() => { setModalOpen(false); setEditRecord(null); }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
