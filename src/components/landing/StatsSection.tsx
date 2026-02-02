const StatsSection = () => {
  return (
    <section className="stats-section">
      <div className="stats-inner">
        <div className="stat-item scroll-reveal">
          <div className="stat-value">10,000+</div>
          <div className="stat-label">Projects completed</div>
        </div>
        <div className="stat-item scroll-reveal scroll-reveal-delay-1">
          <div className="stat-value">24hr</div>
          <div className="stat-label">Average turnaround</div>
        </div>
        <div className="stat-item scroll-reveal scroll-reveal-delay-2">
          <div className="stat-value">99.8%</div>
          <div className="stat-label">Client satisfaction</div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
