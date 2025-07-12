export default function Footer() {
  return (
    <footer className="bg-white border-t border-green-100 px-6 md:px-16 py-8 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Brand & Contact */}
        <div>
          <span className="text-2xl font-serif font-bold text-green-800">
            CWMS
          </span>
          <div className="mt-2 text-sm text-green-900 font-sans">
            <span>Email: </span>
            <a
              href="mailto:reach@cwms.com"
              className="hover:text-green-700 transition"
            >
              reach@cwms.com
            </a>
          </div>
          <div className="text-sm text-green-900 font-sans">
            Sanepa, Lalitpur
          </div>
        </div>

        {/* Newsletter */}
        <form className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="Your email"
            className="px-4 py-2 rounded-xl font-sans border border-green-100 bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-green-700 text-white font-semibold font-sans hover:bg-green-800 transition"
          >
            Subscribe
          </button>
        </form>

        {/* Social Links */}
        <div className="flex space-x-4 text-green-700 text-lg">
          <a
            href="#"
            title="LinkedIn"
            className="hover:text-green-900 transition"
          >
            LinkedIn
          </a>
          <a
            href="#"
            title="Facebook"
            className="hover:text-green-900 transition"
          >
            Facebook
          </a>
          <a
            href="#"
            title="Twitter"
            className="hover:text-green-900 transition"
          >
            Twitter
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 border-t border-green-50 pt-6 text-center text-sm text-green-700 font-sans flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
        <span>© {new Date().getFullYear()} CWMS. All Rights Reserved.</span>
        <a href="#" className="hover:underline mt-2 md:mt-0 text-green-700">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
