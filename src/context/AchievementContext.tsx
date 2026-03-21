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
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface AchievementData {
  id: string;
  text: string;
  image?: string;
  sortOrder?: number;
}

const ACHIEVEMENTS_COL = "achievements";

function compressImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      return resolve(file);
    }
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
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
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

interface AchievementContextType {
  achievements: AchievementData[];
  loading: boolean;
  addAchievement: (text: string, image?: string) => Promise<void>;
  updateAchievement: (id: string, text: string, image?: string) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshAchievements: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const q = query(
        collection(db, ACHIEVEMENTS_COL),
        orderBy("sortOrder")
      );
      const snap = await getDocs(q);
      setAchievements(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as AchievementData))
      );
    } catch (err) {
      console.error("Fetch achievements error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const addAchievement = async (text: string, image?: string) => {
    const data: Record<string, unknown> = { text, sortOrder: Date.now() };
    if (image) data.image = image;
    const docRef = await addDoc(collection(db, ACHIEVEMENTS_COL), data);
    setAchievements((prev) => [
      ...prev,
      { id: docRef.id, text, image, sortOrder: data.sortOrder as number },
    ]);
  };

  const updateAchievement = async (id: string, text: string, image?: string) => {
    const data: Record<string, unknown> = { text };
    data.image = image ?? null;
    const docRef = doc(db, ACHIEVEMENTS_COL, id);
    await updateDoc(docRef, data);
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, text, image } : a))
    );
  };

  const deleteAchievement = async (id: string) => {
    const docRef = doc(db, ACHIEVEMENTS_COL, id);
    await deleteDoc(docRef);
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file, 1200, 0.75);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(compressed);
    });
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        loading,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        uploadImage,
        refreshAchievements: fetchAchievements,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx)
    throw new Error("useAchievements must be used within AchievementProvider");
  return ctx;
}
