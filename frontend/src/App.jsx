import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { routes } from "./config/Route.config";
import AlertBanner from "./components/AlertBanner";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
        <AlertBanner />
      </Router>
    </AuthProvider>
  );
}

export default App;
