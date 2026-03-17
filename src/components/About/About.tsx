import { useRef } from "react";
import { motion, useInView, type Easing } from "framer-motion";
import Lanyard from "../Lanyard/Lanyard";
import "./About.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as Easing },
  }),
};

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="about" id="about" ref={ref}>
      <div className="about-container">
        {/* 3D Lanyard Card */}
        <Lanyard />

        {/* About Content */}
        <div className="about-content">
          <motion.div
            className="about-text"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0}
          >
            <h2>
              Hi, I'm <strong>Musa</strong>
            </h2>
            <p>
              Mahasiswa D4 Teknik Informatika semester 6 di Politeknik Negeri Jember
              (IPK&nbsp;3,74/4,00). Saya berfokus pada web &amp; mobile development,
              sekaligus menekuni animasi, 3D&nbsp;modeling (Blender), dan video editing.
              Bagi saya, teknologi dan kreativitas visual adalah dua sisi yang tidak
              terpisahkan — saya membangun aplikasi yang tidak hanya bekerja dengan
              baik, tetapi juga terasa tepat untuk penggunanya.
            </p>
          </motion.div>

          <div className="info-columns">
            {/* Experience Column */}
            <motion.div
              className="info-column"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={1}
            >
              <h3>EXPERIENCE</h3>
              <InfoItem
                title="Web &amp; Mobile Developer — JTI Innovation Center (Magang)"
                date="Politeknik Negeri Jember"
              />
              <InfoItem
                title="Mobile &amp; Web Developer — Slearn"
                date="Platform pembelajaran digital"
              />
              <InfoItem
                title="Web Developer — Ukerma"
                date="Sistem informasi unit kegiatan mahasiswa"
              />
              <InfoItem
                title="Mobile Developer — Dikantin Polije"
                date="Aplikasi kantin digital Politeknik Negeri Jember"
              />
              <InfoItem
                title="Web Developer — Polaris"
                date="Website perpustakaan Politeknik Pelayaran Surabaya"
              />
              <InfoItem
                title="Web Developer — Parcel Payment DWP Polije"
                date="Sistem pembayaran parsel"
              />
              <InfoItem
                title="Mobile Developer (Lead) — M3 Care"
                date="Aplikasi kesehatan SMA Muhammadiyah 3 Jember"
              />
              <InfoItem
                title="Desktop Developer — UD Barokah Accessories"
                date="Aplikasi manajemen toko"
              />
            </motion.div>

            {/* Achievements Column */}
            <motion.div
              className="info-column"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={2}
            >
              <h3>ACHIEVEMENTS</h3>
              <InfoItem
                title="🥇 Juara 1 Poster Animasi — KMIPN VII 2025"
                date="Kompetisi Mahasiswa Informatika &amp; Ilmu Komputer Nasional"
              />
              <InfoItem
                title="Finalis Animasi — KMIPN VI 2024"
                date="Kompetisi Mahasiswa Informatika &amp; Ilmu Komputer Nasional"
              />
              <InfoItem
                title="12 Besar — Refactory Hackathon UGM 2026"
                date="Peran: Hacker &amp; Hipster · Produk: Syncoflow (AI meeting &amp; task automation)"
              />

              <h3 className="softwares-title">TECH STACK</h3>
              <div className="tech-tags">
                {["Laravel", "Blade", "Flutter", "Dart", "React", "TypeScript", "Blender"].map(
                  (tech) => (
                    <span key={tech} className="tech-tag">
                      {tech}
                    </span>
                  )
                )}
              </div>
            </motion.div>

            {/* Contact Column */}
            <motion.div
              className="info-column"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={3}
            >
              <h3>EDUCATION</h3>
              <InfoItem
                title="D4 Teknik Informatika"
                date="Politeknik Negeri Jember · IPK 3,74/4,00 · 2022–sekarang"
              />

              <h3 className="softwares-title">CONTACT</h3>
              <ContactItem
                icon="github"
                iconClass="fab fa-github"
                text="github.com/musahabibulloh17"
                href="https://github.com/musahabibulloh17"
              />
              <ContactItem
                icon="linkedin"
                iconClass="fab fa-linkedin-in"
                text="linkedin.com/in/musa-habibulloh-al-faruq"
                href="https://www.linkedin.com/in/musa-habibulloh-al-faruq-49648b265/"
              />
              <ContactItem
                icon="gmail"
                iconClass="fas fa-envelope"
                text="musahabibullah3@gmail.com"
                href="mailto:musahabibullah3@gmail.com"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Sub-components --- */

function InfoItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="info-item">
      <h4>{title}</h4>
      <p className="date">{date}</p>
    </div>
  );
}

function ContactItem({
  icon,
  iconClass,
  text,
  href,
}: {
  icon: string;
  iconClass: string;
  text: string;
  href: string;
}) {
  return (
    <div className="contact-item">
      <div className={`contact-icon ${icon}`}>
        <i className={iconClass} />
      </div>
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      </div>
    </div>
  );
}
