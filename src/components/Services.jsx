const services = [
  {
    title: "Multi-Level Dashboard",
    description:
      "Get a bird’s-eye view of all your projects and their progress.",
  },
  {
    title: "Integrated Chat",
    description:
      "Communicate instantly with your team directly inside your workspace.",
  },
  {
    title: "Automated Notifications",
    description: "Stay updated with timely reminders and project alerts.",
  },
  {
    title: "Analytics & Insights",
    description:
      "Make informed decisions with real-time analytics and reporting.",
  },
];

export default function Services() {
  return (
    <section id="services" className="max-w-6xl mx-auto px-6 md:px-16 py-12">
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
        Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, i) => (
          <div
            key={i}
            className="bg-gray-50 rounded-2xl shadow-md p-6 transition hover:shadow-lg"
          >
            <h3 className="font-serif text-xl text-green-700 font-semibold mb-3">
              {service.title}
            </h3>
            <p className="text-gray-700 font-sans leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
