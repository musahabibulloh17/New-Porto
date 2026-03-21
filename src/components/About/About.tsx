import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence, type Easing } from "framer-motion";
import Lanyard from "../Lanyard/Lanyard";
import { useAchievements, type AchievementData } from "../../context/AchievementContext";
import "./About.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as Easing },
  }),
};

const campuses = [
  {
    name: "",
    logo: "/assets/lanyard/polije-logo.png",
  },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const { achievements, loading } = useAchievements();
  const [selected, setSelected] = useState<AchievementData | null>(null);

  return (
    <section className="about" id="about" ref={ref}>

      {/* ── Row 1: Lanyard (kiri) + About Me (kanan) ── */}
      <div className="about-top">
        <motion.div
          className="about-lanyard"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0}
        >
          <Lanyard />
        </motion.div>

        <motion.div
          className="about-text"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          custom={1}
        >
          <h2>About me</h2>
          <p>
            Mahasiswa D4 Teknik Informatika semester 6 di Politeknik Negeri Jember (IPK 3,74/4,00). Saya berfokus pada web & mobile development, sekaligus menekuni animasi, 3D modeling (Blender), dan video editing. Bagi saya, teknologi dan kreativitas visual adalah dua sisi yang tidak terpisahkan — saya membangun aplikasi yang tidak hanya bekerja dengan baik, tetapi juga terasa tepat untuk penggunanya.
          </p>
        </motion.div>
      </div>

      {/* ── Row 2: My Campus ── */}
      <motion.div
        className="campus-section"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeUp}
        custom={2}
      >
        <p className="section-label">My Campus:</p>
        <div className="campus-logos">
          {campuses.map((c) => (
            <div key={c.logo} className="campus-item">
              <img src={c.logo} alt={c.name} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <span className="campus-name">{c.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Row 3: My Achievement ── */}
      <motion.div
        className="achievement-section"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeUp}
        custom={3}
      >
        <h3>My Achievement</h3>
        {loading ? (
          <p className="achievement-loading">Loading...</p>
        ) : (
          <div className="achievement-grid">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`achievement-card${ach.image ? " has-image" : ""}`}
                onClick={() => ach.image && setSelected(ach)}
              >
                <p>"{ach.text}"</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Certificate Modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="cert-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="cert-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cert-modal-header">
                <h4>{selected.text}</h4>
                <button className="cert-close" onClick={() => setSelected(null)}>
                  ×
                </button>
              </div>
              <div className="cert-modal-body">
                <img src={selected.image} alt={selected.text} />
              </div>
              <div className="cert-modal-footer">
                <button className="cert-btn-close" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
