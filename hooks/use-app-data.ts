"use client";

import { useEffect, useState } from "react";
import { loadAppData, getAppStorageEventName } from "@/lib/app-storage";

export function useAppData() {
  const [data, setData] = useState(loadAppData());

  useEffect(() => {
    const eventName = getAppStorageEventName();

    function atualizar() {
      setData(loadAppData());
    }

    window.addEventListener(eventName, atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener(eventName, atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return data;
}

