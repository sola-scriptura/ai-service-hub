const ExpertsSection = () => {
  return (
    <section className="experts-section" id="experts">
      <div className="experts-inner">
        <div className="section-header">
          <div className="section-label">Our Experts</div>
          <h2 className="section-title">Vetted specialists in every field</h2>
        </div>
        <div className="experts-grid">
          <div className="expert-card scroll-reveal">
            <div className="expert-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h3>Senior Developers</h3>
            <p>10+ years at FAANG &amp; startups</p>
            <div className="expert-stat">500+</div>
            <div className="expert-stat-label">code reviews/mo</div>
          </div>
          <div className="expert-card scroll-reveal scroll-reveal-delay-1">
            <div className="expert-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Licensed Attorneys</h3>
            <p>Bar-certified, NDA-signed</p>
            <div className="expert-stat">$50M+</div>
            <div className="expert-stat-label">contracts reviewed</div>
          </div>
          <div className="expert-card scroll-reveal scroll-reveal-delay-2">
            <div className="expert-icon">
              <svg viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h3>PhD Researchers</h3>
            <p>Published in top journals</p>
            <div className="expert-stat">94%</div>
            <div className="expert-stat-label">1st-submit acceptance</div>
          </div>
          <div className="expert-card scroll-reveal scroll-reveal-delay-3">
            <div className="expert-icon">
              <svg viewBox="0 0 24 24">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <h3>Editor-in-Chiefs</h3>
            <p>Former leads at major publications</p>
            <div className="expert-stat">340%</div>
            <div className="expert-stat-label">avg engagement lift</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertsSection;
