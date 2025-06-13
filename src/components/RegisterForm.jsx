export default function RegisterForm() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-cyan-900 font-serif">
        Registration
      </h2>
      <input
        type="email"
        placeholder="Email"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
      />
      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
      />
      <button className="w-full py-2 rounded mt-2 bg-orange-800 text-white font-medium font-sans hover:bg-green-600 transition">
        Register
      </button>
    </div>
  );
}
