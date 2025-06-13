const features = [
  {
    title: "Multi Level Dashboard",
    icon: "/dashboard-icon.svg",
    bg: "#E6F4F4",
    color: "#024950",
  },
  {
    title: "In-app Chat Functionality",
    icon: "/chat-icon.svg",
    bg: "#024950",
    color: "#FFFFFF",
  },
  {
    title: "Email Update and Notification",
    icon: "/email-icon.svg",
    bg: "#0FAA4F",
    color: "#FFFFFF",
  },
  {
    title: "Content Creation Powerhouse",
    icon: "/content-icon.svg",
    bg: "#E6F4F4",
    color: "#024950",
  },
  {
    title: "Analytics and Tracking",
    icon: "/analytics-icon.svg",
    bg: "#024950",
    color: "#FFFFFF",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="px-6 md:px-12 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="rounded-xl p-6 flex flex-col items-start shadow"
            style={{ backgroundColor: feature.bg, color: feature.color }}
          >
            <div className="flex items-center mb-4">
              <img src={feature.icon} alt="" className="w-10 h-10 mr-3" />
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: 600,
                  color: feature.color === "#FFFFFF" ? "#AFDDE5" : "#0FAA4F",
                }}
              >
                {feature.title}
              </h3>
            </div>
            <a
              href="#"
              className="mt-auto font-medium"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "#0FAA4F",
                fontSize: "clamp(16px, 1.5vw, 18px)",
              }}
            >
              Learn more &rarr;
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
