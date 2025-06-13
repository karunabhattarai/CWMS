export default function ServicesSection() {
  return (
    <section id="services" className="px-6 md:px-12 py-12 bg-white">
      <h2
        className="mb-2"
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 600,
          color: "#AFDDE5",
        }}
      >
        Services
      </h2>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(16px, 1.5vw, 18px)",
          color: "#024950",
        }}
      >
        We offer several services. Our SAAS is for the Content Creator looking
        to supercharge their workflow with the most robust tools available.
      </p>
    </section>
  );
}
