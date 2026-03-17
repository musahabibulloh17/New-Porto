import { motion } from "framer-motion";
import "./Hero.css";

const LETTERS = [
  { char: "P", cls: "p1", y: 10 },
  { char: "o", cls: "o1", y: 20 },
  { char: "r", cls: "r1", y: -5 },
  { char: "t", cls: "t1", y: -15, rot: 5 },
  { char: "f", cls: "f1", y: 5 },
  { char: "o", cls: "o2", y: 25 },
  { char: "l", cls: "l1", y: 15 },
  { char: "i", cls: "i1", y: 0 },
  { char: "o", cls: "o3", y: 20 },
];

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-title">
          <h1 className="portfolio-text">
            {LETTERS.map((l, i) => (
              <motion.span
                key={l.cls}
                className={`letter ${l.cls}`}
                initial={{ opacity: 0, y: 80, rotate: 15 }}
                animate={{ opacity: 1, y: l.y, rotate: l.rot ?? 0 }}
                transition={{
                  delay: 0.15 + i * 0.07,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 150,
                  damping: 12,
                }}
                whileHover={{ y: l.y - 12, rotate: (l.rot ?? 0) - 5, scale: 1.1 }}
              >
                {l.char}
              </motion.span>
            ))}
          </h1>

          <motion.span
            className="year-badge"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6, type: "spring", stiffness: 200 }}
          >
            '26
          </motion.span>
        </div>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
        >
          MUSA HABIBULLOH AL FARUQ
        </motion.p>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
        >
          Web &amp; Mobile Developer · Animator · Creative Technologist
        </motion.p>
      </div>
    </section>
  );
}
