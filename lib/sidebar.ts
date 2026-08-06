import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

export function getSidebarState() {
  if (typeof window === "undefined") return false;
  return loadFromStorage<any>("cp-sidebar-open", null) === "true";
}

export function setSidebarState(open: boolean) {
  if (typeof window === "undefined") return;
  saveToStorage("cp-sidebar-open", open ? "true" : "false");
}


