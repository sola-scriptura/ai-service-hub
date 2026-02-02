const FeaturesSection = () => {
  return (
    <section className="features-section" id="features">
      <div className="features-inner">
        <div className="section-header">
          <div className="section-label">Why eydits</div>
          <h2 className="section-title">Expert review that scales</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card span-8 scroll-reveal">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Vetted industry experts</h3>
            <p>
              Licensed attorneys, senior engineers, video editors, PhD researchers, and
              professional designers—all with 10+ years experience in their field.
            </p>
            <div className="feature-visual">
              <div className="feature-tags">
                <span className="feature-tag">Attorneys</span>
                <span className="feature-tag">Sr. Engineers</span>
                <span className="feature-tag">Video Editors</span>
                <span className="feature-tag">PhDs</span>
                <span className="feature-tag">Designers</span>
              </div>
            </div>
          </div>
          <div className="feature-card span-4 scroll-reveal scroll-reveal-delay-1">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>24-hour turnaround</h3>
            <p>Most projects delivered within 24 hours. Rush options available for urgent needs.</p>
          </div>
          <div className="feature-card span-4 scroll-reveal scroll-reveal-delay-2">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </div>
            <h3>Unlimited revisions</h3>
            <p>
              Not satisfied? We'll revise until you are—or give you a full refund. No questions
              asked.
            </p>
          </div>
          <div className="feature-card span-8 scroll-reveal scroll-reveal-delay-3">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Enterprise-grade security</h3>
            <p>
              SOC 2 Type II compliant. HIPAA-ready. All experts sign NDAs. Your data is encrypted
              end-to-end and deleted within 30 days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
