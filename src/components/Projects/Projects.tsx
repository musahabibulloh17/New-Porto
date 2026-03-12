import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Easing,
} from "framer-motion";
import "./Projects.css";

interface Project {
  name: string;
  desc: string;
  color: string;
  mockup: "phones" | "browser" | "laptop" | "phone";
  numberColor: string;
}

const PROJECTS: Project[] = [
  {
    name: "TRAVLO",
    desc: "Accessible Travel for people with special needs",
    color: "#a8d5a2",
    mockup: "phones",
    numberColor: "rgba(76, 175, 80, 0.25)",
  },
  {
    name: "SANORA",
    desc: "Website Design for a premium safety wear brand",
    color: "#5a8f5a",
    mockup: "browser",
    numberColor: "rgba(46, 125, 50, 0.25)",
  },
  {
    name: "FACTORY FLOW",
    desc: "Factory Management System",
    color: "#e74c3c",
    mockup: "laptop",
    numberColor: "rgba(244, 67, 54, 0.25)",
  },
  {
    name: "AGODA",
    desc: "Re-design for the AGODA Website",
    color: "#c0392b",
    mockup: "phone",
    numberColor: "rgba(211, 47, 47, 0.25)",
  },
  {
    name: "BALANCIFY",
    desc: "Work-life balance, simplified and smart",
    color: "#5b9bd5",
    mockup: "phones",
    numberColor: "rgba(21, 101, 192, 0.25)",
  },
];

const NUMBERS = ["01", "02", "03", "04", "05"];
const NUM_OFFSETS = [20, 30, 5, 35, 10];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as Easing,
    },
  }),
};

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardsRef, { once: true, margin: "-50px" });

  // Parallax for content numbers
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section className="projects" id="projects" ref={sectionRef}>
      {/* Content Header */}
      <div className="content-header">
        <div className="content-numbers">
          {NUMBERS.map((num, i) => (
            <ParallaxNum
              key={num}
              num={num}
              index={i}
              scrollYProgress={scrollYProgress}
              baseOffset={NUM_OFFSETS[i]}
            />
          ))}
        </div>
        <motion.h2
          className="content-title"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          CONTENT
        </motion.h2>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid" ref={cardsRef}>
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.name}
            className="project-card"
            custom={i}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="project-preview"
              style={{ backgroundColor: project.color }}
            >
              <Mockup type={project.mockup} />
            </div>
            <div
              className="project-number"
              style={{ color: project.numberColor }}
            >
              {i + 1}
            </div>
            <div className="project-info">
              <h3>{project.name}</h3>
              <p>{project.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* --- Parallax Number --- */
function ParallaxNum({
  num,
  index,
  scrollYProgress,
  baseOffset,
}: {
  num: string;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  baseOffset: number;
}) {
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [baseOffset, baseOffset - 20 - index * 5]
  );

  return (
    <motion.span className={`num n${index + 1}`} style={{ y }}>
      {num}
    </motion.span>
  );
}

/* --- Mockup Components --- */
function Mockup({ type }: { type: Project["mockup"] }) {
  switch (type) {
    case "phones":
      return (
        <div className="project-mockup">
          <div className="phone-mockup">
            <div className="phone-screen" />
          </div>
          <div className="phone-mockup second">
            <div className="phone-screen" />
          </div>
        </div>
      );
    case "phone":
      return (
        <div className="project-mockup">
          <div className="phone-mockup">
            <div className="phone-screen" />
          </div>
        </div>
      );
    case "browser":
      return (
        <div className="project-mockup">
          <div className="browser-mockup">
            <div className="browser-screen" />
          </div>
        </div>
      );
    case "laptop":
      return (
        <div className="project-mockup">
          <div className="laptop-mockup">
            <div className="laptop-screen" />
          </div>
        </div>
      );
  }
}
