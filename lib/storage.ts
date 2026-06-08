import { supabase } from "./supabase";
import { ContainerRecord } from "@/types";

function mapRow(row: any): ContainerRecord {
  return {
    id: row.id,
    blNo: row.bl_no,
    title: row.title,
    description: row.description || "",
    containerCount: row.container_count || "",
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function getContainers(): Promise<ContainerRecord[]> {
  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRow);
}

export async function saveContainer(record: ContainerRecord): Promise<void> {
  const { error } = await supabase.from("containers").upsert({
    id: record.id,
    bl_no: record.blNo,
    title: record.title,
    description: record.description,
    container_count: record.containerCount,
    created_at: new Date(record.createdAt).toISOString(),
    updated_at: new Date(record.updatedAt).toISOString(),
  });

  if (error) throw error;
}

export async function deleteContainer(id: string): Promise<void> {
  const { error } = await supabase
    .from("containers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function searchContainers(query: string): Promise<ContainerRecord[]> {
  const q = query.trim();
  if (!q) return getContainers();

  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .or(`bl_no.ilike.%${q}%,title.ilike.%${q}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRow);
}
