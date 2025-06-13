export default function Footer() {
  return (
    <footer
      className="px-6 md:px-12 py-8 rounded-t-xl mt-12"
      style={{ backgroundColor: "#024950", color: "#FFFFFF" }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        <div>
          <h4
            className="mb-2"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.25rem",
              color: "#0FAA4F",
            }}
          >
            Contact us
          </h4>
          <p style={{ fontFamily: "'Inter', sans-serif" }}>
            Email: reach@cwmis.com
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif" }}>Phone: 9800000000</p>
          <p style={{ fontFamily: "'Inter', sans-serif" }}>
            Address: Butwal-05, Rupandehi
          </p>
        </div>
        <div>
          <form className="flex flex-col md:flex-row items-center gap-2">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-2 rounded"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "#024950",
                backgroundColor: "#FFFFFF",
                border: "none",
              }}
            />
            <button
              className="rounded px-6 py-2"
              style={{
                backgroundColor: "#0FAA4F",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          {/* Social icons (replace with SVGs or icons as needed) */}
          <a href="#" className="hover:opacity-80">
            LinkedIn
          </a>
          <a href="#" className="hover:opacity-80">
            Facebook
          </a>
          <a href="#" className="hover:opacity-80">
            Twitter
          </a>
        </div>
      </div>
      <div
        className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm"
        style={{ color: "#999999" }}
      >
        <span>© 2025 CWMIS. All Rights Reserved.</span>
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
