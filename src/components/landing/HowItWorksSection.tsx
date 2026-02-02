const HowItWorksSection = () => {
  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <div className="section-header">
          <div className="section-label">How it Works</div>
          <h2 className="section-title">Three steps to perfect</h2>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">1</div>
            <h3>Upload your AI output</h3>
            <p>
              Drop in content from ChatGPT, Claude, Cursor, Runway, or any AI tool. We handle
              docs, code, video, and more.
            </p>
          </div>
          <div className="how-step">
            <div className="how-step-num">2</div>
            <h3>Expert reviews it</h3>
            <p>
              A vetted specialist—attorney, developer, editor, PhD, or designer—reviews and
              refines your content.
            </p>
          </div>
          <div className="how-step">
            <div className="how-step-num">3</div>
            <h3>Ship with confidence</h3>
            <p>
              Get back polished, production-ready work within 24 hours. Unlimited revisions
              included.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
