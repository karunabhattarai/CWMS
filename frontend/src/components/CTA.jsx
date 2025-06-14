export default function CTA() {
  return (
    <section className="bg-green-700 py-12 px-6">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4 text-center">
          Ready to boost your team's productivity?
        </h2>
        <a
          href="/login"
          className="px-8 py-3 rounded bg-white text-green-700 font-semibold font-sans hover:bg-green-100 transition"
        >
          Create Your Free Account
        </a>
      </div>
    </section>
  );
}