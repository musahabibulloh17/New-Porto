import { useState } from "react";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import AdminPanel from "./components/Admin/Admin";
import { ProjectProvider } from "./context/ProjectContext";
import { AchievementProvider } from "./context/AchievementContext";

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <ProjectProvider>
      <AchievementProvider>
        <Hero />
        <About />
        <Projects />

        <footer className="footer">
          <p>&copy; 2026 Musa Habibulloh Al Faruq. All Rights Reserved.</p>
        </footer>

        {/* Admin Toggle */}
        <button
          className="admin-toggle"
          onClick={() => setShowAdmin(true)}
          title="Admin Panel"
        >
          <i className="fas fa-cog" />
        </button>

        {/* Admin Panel Modal */}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </AchievementProvider>
    </ProjectProvider>
  );
}

export default App;
