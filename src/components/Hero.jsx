export default function Hero() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gray-50">
      <div className="md:w-1/2 mt-8 md:mt-0">
        <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
          Streamline Your{" "}
          <span className="text-green-700">Creative Workflow</span>
        </h1>
        <p className="font-sans text-gray-700 text-lg mb-6">
          Manage projects, collaborate with your team, and track progress
          effortlessly—all in one place.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-3 rounded bg-green-700 text-white font-semibold font-sans hover:bg-green-800 transition"
        >
          Get Started
        </a>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img
          src="https://www.cflowapps.com/wp-content/uploads/2020/05/business-process-workflow-mapping.png"
          alt="Workflow Illustration"
          // className="w-64 md:w-96"
        />
      </div>
    </section>
  );
}
