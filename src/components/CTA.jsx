export default function CTASection() {
  return (
    <section
      className="px-6 md:px-12 py-10 rounded-xl flex flex-col md:flex-row items-center justify-between my-8"
      style={{ backgroundColor: "#E6F4F4" }}
    >
      <div>
        <h2
          className="mb-2"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            color: "#024950",
            fontWeight: 600,
          }}
        >
          Let's make things happen
        </h2>
        <p
          className="mb-4 max-w-lg"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(16px, 1.5vw, 18px)",
            color: "#024950",
          }}
        >
          CWMIS is all about managing and delegating so that you can focus on
          the quality work you deserve.
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
      <div className="mt-6 md:mt-0">
        <img src="/cta-illustration.svg" alt="CTA" className="max-w-xs" />
      </div>
    </section>
  );
}
