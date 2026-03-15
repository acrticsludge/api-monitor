"use client";

import { useState, useEffect } from "react";

export default function LocalTime({
  iso,
  format = "datetime",
}: {
  iso: string;
  format?: "datetime" | "time" | "date";
}) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const d = new Date(iso);
    if (format === "time") {
      setLabel(d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));
    } else if (format === "date") {
      setLabel(d.toLocaleDateString());
    } else {
      setLabel(d.toLocaleString());
    }
  }, [iso, format]);

  return <>{label}</>;
}
