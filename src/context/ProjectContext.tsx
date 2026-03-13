import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectData {
  id: string;
  name: string;
  desc: string;
  color: string;
  mockup: "phones" | "browser" | "laptop" | "phone";
  numberColor: string;
  image?: string;
  // Detail popup fields
  description?: string;
  features?: string[];
  developedBy?: string[];
  links?: ProjectLink[];
}

const API_BASE = "/api";

interface ProjectContextType {
  projects: ProjectData[];
  loading: boolean;
  addProject: (project: Omit<ProjectData, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (project: Omit<ProjectData, "id">) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error("Failed to create project");
    const created = await res.json();
    setProjects((prev) => [...prev, created]);
  };

  const updateProject = async (id: string, data: Partial<ProjectData>) => {
    // Send data directly to server — avoid stale state merge issues
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update project");
    const updated = await res.json();
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete project");
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.url;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        addProject,
        updateProject,
        deleteProject,
        uploadImage,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
