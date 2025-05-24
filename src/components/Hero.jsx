import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>One Stop Solution for Creative Mind</h1>
        <p>By the Creatives, for the creatives</p>
        <button className="get-started-btn">Get Started</button>
      </div>
      <div className="hero-image">
        <img src="/hero.png" alt="Creative Solution" />
        <div className="floating-icons">
          <div className="icon heart"><span>❤</span></div>
          <div className="icon share"><span>↗</span></div>
          <div className="icon play"><span>▶</span></div>
          <div className="icon location"><span>📍</span></div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 