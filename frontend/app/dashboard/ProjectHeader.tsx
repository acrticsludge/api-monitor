"use client";

import { useState, useRef, useTransition } from "react";
import { updateProjectName } from "./actions";

interface Props {
  project: { id: string; name: string; slug: string };
}

export default function ProjectHeader({ project }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSave() {
    if (!name.trim() || name === project.name) {
      setEditing(false);
      setName(project.name);
      return;
    }
    startTransition(async () => {
      await updateProjectName(project.id, name);
      setEditing(false);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setName(project.name);
    }
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      <p
        className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 font-medium mr-2"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        Project
      </p>

      {editing ? (
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={pending}
          className="bg-transparent border-b border-[#00ff87]/60 text-[#080808] dark:text-white text-xl font-bold outline-none pb-0.5 min-w-0"
          style={{ fontFamily: "'Syne', sans-serif" }}
        />
      ) : (
        <button onClick={startEdit} className="group flex items-center gap-2">
          <h1
            className="text-xl font-bold text-[#080808] dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {name}
          </h1>
          <svg
            className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
