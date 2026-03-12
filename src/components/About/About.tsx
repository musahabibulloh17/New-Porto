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
              I am an UI/UX Designer and I design because I love solving
              problems, questioning 'why,' and making things feel right. UI/UX
              isn't just about screens, it's about people, habits, and the tiny
              details that make a product worth using. It's not just about
              looking good; it's about feeling effortless. If it makes sense
              without overthinking, I've done my job.
            </p>
          </motion.div>

          <div className="info-columns">
            {/* Experience Column 1 */}
            <motion.div
              className="info-column"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={1}
            >
              <h3>EXPERIENCE</h3>
              <InfoItem
                title="Interaction Design Intern at Sanora Wear"
                date="aug 2024 - feb 2025"
              />
              <InfoItem
                title="Interaction Design Intern at EYJ Health"
                date="june 2024 - aug 2025"
              />
              <InfoItem
                title="Graphic Design & Social Media Intern at We The Change"
                date="june 2023 - aug 2023"
              />
              <InfoItem title="Freelance Designer" date="2023 - PRESENT" />
            </motion.div>

            {/* Experience Column 2 */}
            <motion.div
              className="info-column"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={2}
            >
              <h3>EXPERIENCE</h3>
              <InfoItem
                title="Secretary Discipline Committee, SOD"
                date="discipline committee, upes dehradun"
              />
              <InfoItem
                title="Student Ambassador at UPES"
                date="student ambassador - upes dehradun"
              />
              <InfoItem
                title="Event Head Kalakulture, Club UPES"
                date="kalakulture club, upes dehradun"
              />
              <InfoItem
                title="Registration Team at India HCI 2023"
                date="hci india - 2023 upes dehradun"
              />
            </motion.div>

            {/* Contact Column */}
            <motion.div
              className="info-column"
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={3}
            >
              <h3>CONTACT</h3>
              <ContactItem
                icon="behance"
                iconClass="fab fa-behance"
                text="https://www.behance.net/musahabibulloh"
                href="https://www.behance.net/musahabibulloh"
              />
              <ContactItem
                icon="linkedin"
                iconClass="fab fa-linkedin-in"
                text="https://www.linkedin.com/in/musa-habibulloh-al-faruq-49648b265/"
                href="https://www.linkedin.com/in/musa-habibulloh-al-faruq-49648b265/"
              />
              <ContactItem
                icon="gmail"
                iconClass="fas fa-envelope"
                text="musahabibullah3@gmail.com"
                href="mailto:musahabibullah3@gmail.com"
              />

              <h3 className="softwares-title">SOFTWARES</h3>
              <div className="software-icons">
                <div className="sw-icon figma">
                  <i className="fab fa-figma" />
                </div>
                <div className="sw-icon photoshop">Ps</div>
                <div className="sw-icon sketch">
                  <i className="fas fa-gem" />
                </div>
                <div className="sw-icon xd">Xd</div>
                <div className="sw-icon illustrator">Ai</div>
                <div className="sw-icon indesign">Id</div>
              </div>
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
