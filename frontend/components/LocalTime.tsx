"use client";

import { useState, useEffect } from "react";

export default function LocalTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    setLabel(new Date(iso).toLocaleString());
  }, [iso]);

  return <>{label}</>;
}
