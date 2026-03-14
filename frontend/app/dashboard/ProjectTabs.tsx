"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "./actions";

interface Project {
  id: string;
  name: string;
}

interface Props {
  projects: Project[];
  activeProjectId: string;
  isPro: boolean;
}

export default function ProjectTabs({ projects, activeProjectId, isPro }: Props) {
  const router = useRouter();

  function switchProject(id: string) {
    router.push(`/dashboard?project=${id}`);
  }

  return (
    <div className="flex items-center gap-1 border-b border-black/[0.06] dark:border-white/[0.06] pb-0 mb-6 overflow-x-auto">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => switchProject(project.id)}
          className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
            project.id === activeProjectId
              ? "text-[#00cc6a] dark:text-[#00d294] border-[#00cc6a] dark:border-[#00d294]"
              : "text-neutral-500 border-transparent hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {project.name}
        </button>
      ))}

      {isPro && projects.length < 5 && <AddProjectButton />}

      {!isPro && (
        <div className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] shrink-0">
          <span
            className="text-[10px] text-neutral-500 dark:text-neutral-600"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Multiple projects — Pro
          </span>
        </div>
      )}
    </div>
  );
}

function AddProjectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    setLoading(true);
    try {
      await createProject("New Project");
      router.refresh();
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="ml-2 text-[11px] text-neutral-500 dark:text-neutral-600 hover:text-[#00cc6a] dark:hover:text-[#00d294] transition-colors px-2 py-1 shrink-0 disabled:opacity-40"
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {loading ? "..." : "+ Add project"}
    </button>
  );
}
