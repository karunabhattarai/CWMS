import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
