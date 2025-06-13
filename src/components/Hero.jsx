export default function HeroSection() {
  return (
    <section
      className="w-full flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-12 py-12"
      style={{ backgroundColor: "#024950" }}
    >
      <div className="md:w-1/2 mt-8 md:mt-0">
        <h1
          className="mb-4"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          One Stop Solution for{" "}
          <span style={{ color: "#0FAA4F" }}>Creative Mind</span>
        </h1>
        <p
          className="mb-6"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(16px, 1.5vw, 18px)",
            color: "#E6F4F4",
          }}
        >
          By the Creatives, for the creatives.
        </p>
        <button
          className="rounded px-6 py-3"
          style={{
            backgroundColor: "#964734",
            color: "#FFFFFF",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "clamp(16px, 1.5vw, 18px)",
          }}
        >
          Get Started
        </button>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img
          src="/hero-illustration.svg"
          alt="Creative"
          className="max-w-xs md:max-w-md"
        />
      </div>
    </section>
  );
}
