import { supabase } from "./supabase";
import { DesignConfig } from "../types";

interface DesignRow {
  id: string;
  user_id: string;
  name: string;
  design_data: DesignConfig;
  created_at: string;
  updated_at: string;
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function listDesigns(): Promise<DesignConfig[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("designs")
    .select("id, user_id, name, design_data, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to load designs:", error);
    return [];
  }

  return ((data ?? []) as DesignRow[]).map((row) => ({
    ...row.design_data,
    id: row.id,
    name: row.name,
    createdAt: row.design_data.createdAt ?? row.created_at,
    updatedAt: row.design_data.updatedAt ?? row.updated_at,
  }));
}

export async function saveDesign(
  design: DesignConfig
): Promise<DesignConfig> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You must be signed in to save a design.");
  }

  const updated: DesignConfig = {
    ...design,
    updatedAt: new Date().toISOString(),
    status: "saved",
  };

  const { data, error } = await supabase
    .from("designs")
    .upsert(
      {
        id: updated.id,
        user_id: userId,
        name: updated.name,
        design_data: updated,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      },
      { onConflict: "id" }
    )
    .select("id, user_id, name, design_data, created_at, updated_at")
    .single();

  if (error) {
    console.error("Failed to save design:", error);
    throw new Error("Unable to save the design.");
  }

  const row = data as DesignRow;

  return {
    ...row.design_data,
    id: row.id,
    name: row.name,
    createdAt: row.design_data.createdAt ?? row.created_at,
    updatedAt: row.design_data.updatedAt ?? row.updated_at,
  };
}

export async function deleteDesign(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You must be signed in to delete a design.");
  }

  const { error } = await supabase
    .from("designs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete design:", error);
    throw new Error("Unable to delete the design.");
  }
}

export async function getDesign(
  id: string
): Promise<DesignConfig | undefined> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("designs")
    .select("id, user_id, name, design_data, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load design:", error);
    return undefined;
  }

  if (!data) {
    return undefined;
  }

  const row = data as DesignRow;

  return {
    ...row.design_data,
    id: row.id,
    name: row.name,
    createdAt: row.design_data.createdAt ?? row.created_at,
    updatedAt: row.design_data.updatedAt ?? row.updated_at,
  };
}