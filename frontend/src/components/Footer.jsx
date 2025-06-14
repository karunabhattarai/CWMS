export default function Footer() {
  return (
    <footer className="bg-gray-50 px-6 md:px-16 py-12 rounded-t-xl mt-12 text-gray-700">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        {/* Contact Info */}
        <div>
          <h4 className="text-green-700 font-serif text-xl mb-2">Contact us</h4>
          <p className="font-sans">Email: reach@cwms.com</p>
          <p className="font-sans">Phone: 9800000000</p>
          <p className="font-sans">Address: Sanepa, Lalitpur</p>
        </div>

        {/* Newsletter */}
        <div>
          <form className="flex flex-col md:flex-row items-center gap-3">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-2 rounded font-sans text-gray-900 border border-gray-300 bg-white w-full md:w-auto"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded bg-green-700 text-white font-semibold font-sans hover:bg-green-800 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div className="flex space-x-4 mt-4 md:mt-0 font-sans">
          <a href="#" className="hover:text-green-700 transition">
            LinkedIn
          </a>
          <a href="#" className="hover:text-green-700 transition">
            Facebook
          </a>
          <a href="#" className="hover:text-green-700 transition">
            Twitter
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-sans">
        <span>© 2025 CWMS. All Rights Reserved.</span>
        <a href="#" className="hover:underline mt-2 md:mt-0">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
