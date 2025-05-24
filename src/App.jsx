import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Hero />
      </div>
    </Router>
  );
}

export default App;
