const features = [
  {
    icon: "🗂️",
    title: "Project Boards",
    description:
      "Organize your projects visually, track progress, and keep everyone in sync.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description:
      "Assign roles, add members, and work together seamlessly on every task.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    description:
      "Visualize your progress with clear metrics and keep projects on schedule.",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
        Why Choose CWMIS?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-2xl">
              <span className="text-green-700">{feature.icon}</span>
            </div>
            <h3 className="font-serif font-semibold text-lg text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-center font-sans">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
