import './Services.css';
import CallToAction from './CallToAction';

const Services = () => {
  const services = [
    {
      id: 1,
      title: "Multi Level Dashboard",
      image: "/1.png",
      bgColor: "gray"
    },
    {
      id: 2,
      title: "Multi level Dashboard",
      image: "/2.png",
      bgColor: "lime"
    },
    {
      id: 3,
      title: "In-app Chat Functionality",
      image: "/3.png",
      bgColor: "dark"
    },
    {
      id: 4,
      title: "Email Update and Notification",
      image: "/4.png",
      bgColor: "gray"
    },
    {
      id: 5,
      title: "Content Creation Powerhouse",
      image: "/5.png",
      bgColor: "lime"
    },
    {
      id: 6,
      title: "Analytics and Tracking",
      image: "/6.png",
      bgColor: "dark"
    }
  ];

  return (
    <section className="services">
      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className={`service-card ${service.bgColor}`}>
            <div className="title-tag">
              <span>{service.title}</span>
            </div>
            <div className="service-icon">
              <img src={service.image} alt={service.title} />
            </div>
            <a href="#" className="learn-more">
              Learn more
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        ))}
      </div>
      <CallToAction />
    </section>
  );
};

export default Services; 