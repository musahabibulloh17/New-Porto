import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectData } from "../../context/ProjectContext";
import "./ProjectModal.css";

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>

            {/* Title */}
            <h2 className="modal-title">{project.name}</h2>
            <p className="modal-subtitle">{project.desc}</p>

            {/* Description */}
            {project.description && (
              <div className="modal-section">
                <h3>Description</h3>
                <p>{project.description}</p>
              </div>
            )}

            {/* Main Features */}
            {project.features && project.features.length > 0 && (
              <div className="modal-section">
                <h3>Main Feature :</h3>
                <ol className="modal-list">
                  {project.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Developed By */}
            {project.developedBy && project.developedBy.length > 0 && (
              <div className="modal-section">
                <h3>Developed by :</h3>
                <ol className="modal-list">
                  {project.developedBy.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Product Links */}
            {project.links && project.links.length > 0 && (
              <div className="modal-section">
                <h3>Product Portfolio Links :</h3>
                <ol className="modal-list modal-links">
                  {project.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Close button bottom */}
            <div className="modal-footer">
              <button className="modal-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
