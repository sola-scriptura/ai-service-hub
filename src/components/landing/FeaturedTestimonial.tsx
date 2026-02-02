const FeaturedTestimonial = () => {
  return (
    <section className="featured-section">
      <div className="featured-bg"></div>
      <div className="featured-inner">
        <p className="featured-quote human-voice">
          "Their attorney caught a critical clause our AI draft completely missed. We would have
          faced a six-figure liability without that review."
        </p>
        <div className="featured-author">
          <div className="featured-avatar">SM</div>
          <div className="featured-meta">
            <div className="featured-name">Sarah Martinez</div>
            <div className="featured-role">CEO, TechStart Inc.</div>
          </div>
        </div>
        <div className="featured-stat">
          <div className="featured-stat-value">$2.4M</div>
          <div className="featured-stat-label">potential liability avoided</div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTestimonial;
