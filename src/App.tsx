import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";

function App() {
  return (
    <>
      <Hero />
      <About />
      <Projects />

      <footer className="footer">
        <p>&copy; 2026 Musa Habibulloh Al Faruq. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default App;
