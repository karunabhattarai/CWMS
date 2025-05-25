import './CallToAction.css';

const CallToAction = () => {
  return (
    <div className="cta-card">
      <div className="cta-content">
        <h2>Let's make things happen</h2>
        <p>CWMS is all about managing and delegating so that you can focus the quality work you deserve.</p>
        <button className="get-started-btn">Get Started</button>
      </div>
      <div className="cta-graphics">
        <div className="star-burst"></div>
        <div className="smiley-face"></div>
        <div className="lime-star"></div>
        <div className="gray-star"></div>
        <div className="spiral-line"></div>
      </div>
    </div>
  );
};

export default CallToAction; 