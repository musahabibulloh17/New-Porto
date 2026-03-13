import { useState, useRef, type FormEvent } from "react";
import { useProjects, type ProjectData, type ProjectLink } from "../../context/ProjectContext";
import "./Admin.css";

const ADMIN_PASS = "musa2026";

type MockupType = ProjectData["mockup"];

const MOCKUP_OPTIONS: { value: MockupType; label: string }[] = [
  { value: "phones", label: "📱📱 Dual Phones" },
  { value: "phone", label: "📱 Single Phone" },
  { value: "browser", label: "🌐 Browser" },
  { value: "laptop", label: "💻 Laptop" },
];

const COLOR_PRESETS = [
  "#a8d5a2", "#5a8f5a", "#e74c3c", "#c0392b", "#5b9bd5",
  "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22",
];

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "1"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "1");
      setAuthenticated(true);
      setError("");
    } else {
      setError("Password salah!");
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-overlay">
        <div className="admin-login">
          <button className="admin-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
          <div className="admin-login-icon">
            <i className="fas fa-lock" />
          </div>
          <h2>Admin Login</h2>
          <p>Masukkan password untuk mengakses admin panel</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <span className="admin-error">{error}</span>}
            <button type="submit" className="admin-btn primary">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
    setPassword("");
  };

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>
            <i className="fas fa-cog" /> Admin Panel
          </h2>
          <div className="admin-header-actions">
            <button className="admin-btn small danger" onClick={handleLogout} title="Logout">
              <i className="fas fa-sign-out-alt" /> Logout
            </button>
            <button className="admin-close" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                         */
/* ------------------------------------------------------------------ */
function AdminDashboard() {
  const { projects, addProject, updateProject, deleteProject, uploadImage } = useProjects();
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: Omit<ProjectData, "id">, id?: string) => {
    setSaving(true);
    try {
      if (id) {
        await updateProject(id, data);
        setEditing(null);
      } else {
        await addProject(data);
        setShowAdd(false);
      }
    } catch (err) {
      alert("Gagal menyimpan! " + (err instanceof Error ? err.message : ""));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: ProjectData) => {
    if (!confirm(`Hapus "${project.name}"?`)) return;
    try {
      await deleteProject(project.id);
    } catch (err) {
      alert("Gagal menghapus! " + (err instanceof Error ? err.message : ""));
    }
  };

  return (
    <div className="admin-body">
      <div className="admin-toolbar">
        <span className="admin-count">
          {projects.length} project{projects.length !== 1 && "s"}
        </span>
        <button
          className="admin-btn primary"
          onClick={() => {
            setShowAdd(true);
            setEditing(null);
          }}
        >
          <i className="fas fa-plus" /> Tambah Project
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <ProjectForm
          saving={saving}
          onUploadImage={uploadImage}
          onSave={(data) => handleSave(data)}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Project List */}
      <div className="admin-list">
        {projects.map((project, i) => (
          <div key={project.id} className="admin-card">
            {editing === project.id ? (
              <ProjectForm
                initial={project}
                saving={saving}
                onUploadImage={uploadImage}
                onSave={(data) => handleSave(data, project.id)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="admin-card-row">
                <div className="admin-card-preview">
                  {project.image ? (
                    <img src={project.image} alt={project.name} />
                  ) : (
                    <div
                      className="admin-card-color"
                      style={{ background: project.color }}
                    >
                      <span>{project.mockup}</span>
                    </div>
                  )}
                </div>

                <div className="admin-card-info">
                  <span className="admin-card-num">#{i + 1}</span>
                  <h4>{project.name}</h4>
                  <p>{project.desc}</p>
                </div>

                <div className="admin-card-actions">
                  <button
                    className="admin-btn icon"
                    title="Edit"
                    onClick={() => {
                      setEditing(project.id);
                      setShowAdd(false);
                    }}
                  >
                    <i className="fas fa-pen" />
                  </button>
                  <button
                    className="admin-btn icon danger"
                    title="Hapus"
                    onClick={() => handleDelete(project)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Project Form (Add / Edit)                                         */
/* ------------------------------------------------------------------ */
interface ProjectFormProps {
  initial?: ProjectData;
  saving?: boolean;
  onUploadImage: (file: File) => Promise<string>;
  onSave: (data: Omit<ProjectData, "id">) => void;
  onCancel: () => void;
}

function ProjectForm({ initial, saving, onUploadImage, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PRESETS[0]);
  const [mockup, setMockup] = useState<MockupType>(initial?.mockup ?? "phones");
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [uploading, setUploading] = useState(false);
  const [numberColor, setNumberColor] = useState(
    initial?.numberColor ?? "rgba(0,0,0,0.25)"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [featuresText, setFeaturesText] = useState(
    (initial?.features ?? []).join("\n")
  );
  const [developedByText, setDevelopedByText] = useState(
    (initial?.developedBy ?? []).join("\n")
  );
  const [links, setLinks] = useState<ProjectLink[]>(initial?.links ?? []);
  const fileRef = useRef<HTMLInputElement>(null);
  const linksEndRef = useRef<HTMLDivElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar! Maksimum 5MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await onUploadImage(file);
      setImage(url);
    } catch {
      alert("Gagal upload gambar!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Nama project harus diisi!");

    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const developedBy = developedByText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanLinks = links.filter((l) => l.url.trim()).map((l) => ({
      label: l.label.trim() || l.url.trim(),
      url: l.url.trim(),
    }));

    onSave({
      name: name.trim(),
      desc: desc.trim(),
      color,
      mockup,
      numberColor,
      image,
      description: description.trim(),
      features,
      developedBy,
      links: cleanLinks,
    });
  };

  // Derive numberColor from color
  const handleColorChange = (c: string) => {
    setColor(c);
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    setNumberColor(`rgba(${r}, ${g}, ${b}, 0.25)`);
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { label: "", url: "" }]);
    setTimeout(() => {
      linksEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };
  const removeLink = (i: number) =>
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: "label" | "url", value: string) =>
    setLinks((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l))
    );

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit Project" : "Tambah Project Baru"}</h3>

      <div className="admin-form-grid">
        {/* Image upload */}
        <div className="admin-form-image">
          <div
            className="admin-image-preview"
            style={{ background: image ? "none" : color }}
            onClick={() => fileRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="preview" />
            ) : (
              <div className="admin-image-placeholder">
                <i className="fas fa-camera" />
                <span>Upload Foto</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImage}
          />
          <div className="admin-image-btns">
            <button
              type="button"
              className="admin-btn small"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <i className={uploading ? "fas fa-spinner fa-spin" : "fas fa-upload"} />
              {uploading ? " Uploading..." : " Upload"}
            </button>
            {image && (
              <button
                type="button"
                className="admin-btn small danger"
                onClick={() => setImage(undefined)}
              >
                <i className="fas fa-times" /> Hapus
              </button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="admin-form-fields">
          <label>
            Nama Project
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TRAVLO"
            />
          </label>

          <label>
            Deskripsi Singkat
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Deskripsi singkat project..."
              rows={2}
            />
          </label>

          <label>
            Mockup Type
            <select
              value={mockup}
              onChange={(e) => setMockup(e.target.value as MockupType)}
            >
              {MOCKUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Warna Background
            <div className="admin-color-row">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <div className="admin-color-presets">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`admin-color-dot${c === color ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => handleColorChange(c)}
                  />
                ))}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Detail Fields (for popup) */}
      <div className="admin-detail-section">
        <h4 className="admin-detail-title">
          <i className="fas fa-info-circle" /> Detail Popup
        </h4>

        <label>
          Description (Deskripsi lengkap)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi lengkap project yang akan muncul di popup..."
            rows={3}
          />
        </label>

        <label>
          Main Features (satu per baris)
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"Feature 1\nFeature 2\nFeature 3"}
            rows={4}
          />
        </label>

        <label>
          Developed By (satu per baris)
          <textarea
            value={developedByText}
            onChange={(e) => setDevelopedByText(e.target.value)}
            placeholder={"Nama (Role)\nNama 2 (Role)"}
            rows={2}
          />
        </label>

        <div className="admin-links-section">
          <div className="admin-links-header">
            <span>Product Links</span>
            <button type="button" className="admin-btn small" onClick={addLink}>
              <i className="fas fa-plus" /> Tambah Link
            </button>
          </div>
          {links.map((link, i) => (
            <div key={i} className="admin-link-row">
              <input
                type="text"
                placeholder="Label (e.g. Website)"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
              />
              <input
                type="text"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
              />
              <button
                type="button"
                className="admin-btn icon danger"
                onClick={() => removeLink(i)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ))}
          {links.length === 0 && (
            <p className="admin-links-empty">Belum ada link ditambahkan</p>
          )}
          <div ref={linksEndRef} />
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={saving || uploading}>
          Batal
        </button>
        <button type="submit" className="admin-btn primary" disabled={saving || uploading}>
          <i className={saving ? "fas fa-spinner fa-spin" : "fas fa-save"} />
          {saving ? " Menyimpan..." : initial ? " Simpan" : " Tambah"}
        </button>
      </div>
    </form>
  );
}
