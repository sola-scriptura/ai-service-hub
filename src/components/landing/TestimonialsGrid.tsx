const StarIcon = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FiveStars = () => (
  <div className="testimonial-stars">
    <StarIcon />
    <StarIcon />
    <StarIcon />
    <StarIcon />
    <StarIcon />
  </div>
);

const testimonials = [
  {
    highlight: true,
    text: '"I vibe code everything with Cursor and Claude, but I was nervous about shipping to production. eydits\' engineers caught three security vulnerabilities and cleaned up my entire codebase. Now it\'s my secret weapon."',
    initials: 'AK',
    name: 'Alex Kim',
    role: 'Indie Hacker',
  },
  {
    text: '"Runway gave me 80% of my video. eydits gave me the last 20% that made it actually professional."',
    initials: 'MR',
    name: 'Maya Rodriguez',
    role: 'YouTuber, 500K subs',
  },
  {
    text: '"Paper accepted on first submission. The PhD reviewer was more thorough than my advisor."',
    initials: 'PD',
    name: 'Dr. Priya Desai',
    role: 'Researcher',
  },
  {
    text: '"Midjourney + their designer = ads that actually look on-brand. 340% ROAS improvement."',
    initials: 'JC',
    name: 'James Chen',
    role: 'Marketing Director',
  },
  {
    text: '"Finally, I ship with confidence. No more second-guessing every AI output."',
    initials: 'RK',
    name: 'Rachel Kim',
    role: 'Startup Founder',
  },
];

const TestimonialsGrid = () => {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-inner">
        <div className="section-header">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">Loved by teams everywhere</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className={`testimonial-card${t.highlight ? ' highlight' : ''}`}>
              <FiveStars />
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsGrid;
