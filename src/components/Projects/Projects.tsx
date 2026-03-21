import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Easing,
} from "framer-motion";
import { useProjects } from "../../context/ProjectContext";
import type { ProjectData } from "../../context/ProjectContext";
import ProjectModal from "../ProjectModal/ProjectModal";
import "./Projects.css";

const NUM_OFFSETS = [20, 30, 5, 35, 10, 20, 15, 25, 10, 30];

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
  const { projects } = useProjects();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardsRef, { once: true, margin: "-50px" });
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // Generate number strings
  const numbers = projects.map((_, i) => String(i + 1).padStart(2, "0"));

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
          {numbers.map((num, i) => (
            <ParallaxNum
              key={num}
              num={num}
              index={i}
              scrollYProgress={scrollYProgress}
              baseOffset={NUM_OFFSETS[i % NUM_OFFSETS.length]}
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
          PROJECTS
        </motion.h2>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid" ref={cardsRef}>
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            className="project-card"
            custom={i}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setSelectedProject(project)}
          >
            <div
              className="project-preview"
              style={{ backgroundColor: project.color }}
            >
              {project.image ? (
                <img
                  className="project-image"
                  src={project.image}
                  alt={project.name}
                />
              ) : (
                <Mockup type={project.mockup} />
              )}
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

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
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
function Mockup({ type }: { type: ProjectData["mockup"] }) {
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
