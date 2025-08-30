import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { routes } from "./config/Route.config";
import AlertBanner from "./components/AlertBanner";
import GlobalAlertListener from "./components/GlobalAlertListener";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <GlobalAlertListener />
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
          <AlertBanner />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
