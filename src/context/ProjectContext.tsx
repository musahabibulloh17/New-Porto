import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";

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

/* ── Default seed data (auto-seeded to Firestore on first load) ── */
const SEED_PROJECTS: Omit<ProjectData, "id">[] = [
  { name: "TRAVLO", desc: "Accessible Travel for people with special needs", color: "#a8d5a2", mockup: "phones", numberColor: "rgba(76, 175, 80, 0.25)", description: "Travlo is a mobile application designed to make traveling more accessible for people with special needs.", features: ["Accessibility-focused travel recommendations", "Real-time navigation assistance", "Community reviews & ratings", "Multi-language support"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { name: "SANORA", desc: "Website Design for a premium safety wear brand", color: "#5a8f5a", mockup: "browser", numberColor: "rgba(46, 125, 50, 0.25)", description: "A complete website redesign for Sanora Wear, a premium safety wear brand.", features: ["Modern & clean UI design", "Product catalog with filtering", "Responsive across all devices"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { name: "FACTORY FLOW", desc: "Factory Management System", color: "#e74c3c", mockup: "laptop", numberColor: "rgba(244, 67, 54, 0.25)", description: "Factory Flow is a comprehensive factory management system.", features: ["Production workflow management", "Real-time inventory tracking", "Worker scheduling & management", "Analytics dashboard"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { name: "AGODA", desc: "Re-design for the AGODA Website", color: "#c0392b", mockup: "phone", numberColor: "rgba(211, 47, 47, 0.25)", description: "A UI/UX redesign concept for the Agoda booking platform.", features: ["Simplified booking flow", "Improved search & filter UX", "Modern visual redesign"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { name: "BALANCIFY", desc: "Work-life balance, simplified and smart", color: "#5b9bd5", mockup: "phones", numberColor: "rgba(21, 101, 192, 0.25)", description: "Balancify is a smart app that helps users maintain a healthy work-life balance.", features: ["Smart task scheduling", "Wellness & mood tracking", "Mindful break reminders", "Weekly balance reports"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
];

const PROJECTS_COL = "projects";

/** Compress image client-side before uploading to Firebase Storage */
function compressImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // SVG/GIF — don't compress, return as-is
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      return resolve(file);
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if larger than maxSize
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Use webp for better compression, fallback to jpeg
      const outputType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        outputType,
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

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
      const q = query(collection(db, PROJECTS_COL), orderBy("sortOrder"));
      const snap = await getDocs(q);

      if (snap.empty) {
        // First time — seed Firestore with defaults
        const batch = writeBatch(db);
        const seeded: ProjectData[] = [];

        SEED_PROJECTS.forEach((p, i) => {
          const docRef = doc(collection(db, PROJECTS_COL));
          const data = { ...p, sortOrder: i + 1 };
          batch.set(docRef, data);
          seeded.push({ id: docRef.id, ...p });
        });

        await batch.commit();
        setProjects(seeded);
      } else {
        setProjects(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectData))
        );
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
      // Fallback — show seed data without ids so at least something shows
      setProjects(SEED_PROJECTS.map((p, i) => ({ ...p, id: `local-${i}` })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (project: Omit<ProjectData, "id">) => {
    // Firestore rejects undefined values — convert to null
    const clean: Record<string, unknown> = { sortOrder: Date.now() };
    for (const [k, v] of Object.entries(project)) {
      clean[k] = v === undefined ? null : v;
    }
    const docRef = await addDoc(collection(db, PROJECTS_COL), clean);
    setProjects((prev) => [...prev, { id: docRef.id, ...project }]);
  };

  const updateProject = async (id: string, data: Partial<ProjectData>) => {
    // Firestore rejects undefined values — convert to null
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      clean[k] = v === undefined ? null : v;
    }
    const docRef = doc(db, PROJECTS_COL, id);
    await updateDoc(docRef, clean);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProject = async (id: string) => {
    const docRef = doc(db, PROJECTS_COL, id);
    await deleteDoc(docRef);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Compress image then convert to base64 (stored directly in Firestore)
    const compressed = await compressImage(file, 800, 0.6);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(compressed);
    });
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
