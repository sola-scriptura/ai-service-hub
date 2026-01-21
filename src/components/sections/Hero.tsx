import { Button } from '@/components/ui/button';

const Hero = () => {
  const trustStats = [
    { number: '24hrs', label: 'Avg. Turnaround' },
    { number: '99.8%', label: 'Client Satisfaction' },
    { number: '10K+', label: 'Projects Completed' },
  ];

  return (
    <section className="relative bg-primary-900 text-white py-16 md:py-32 px-[5%] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero" />

      <div className="relative z-10 max-w-[900px] mx-auto text-center">
        <span className="inline-block bg-accent/15 text-accent-400 px-6 py-2 rounded-full text-sm font-semibold mb-6 border border-accent/30">
          Professional Human Editors
        </span>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight leading-tight">
          AI Creates. Humans Perfect.
        </h1>

        <h2 className="text-lg md:text-xl lg:text-2xl font-normal mb-12 opacity-90 max-w-[750px] mx-auto leading-relaxed">
          Transform your AI outputs into flawless, work-ready deliverables with expert human review
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <Button asChild size="lg" variant="hero">
            <a href="#services">Get Your Free Quote →</a>
          </Button>
          <Button asChild size="lg" variant="heroSecondary">
            <a href="#how">See How It Works</a>
          </Button>
        </div>

        {/* Trust Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-16 pt-12 border-t border-white/10">
          {trustStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="block font-display text-3xl md:text-4xl font-extrabold text-accent-400">
                {stat.number}
              </span>
              <span className="text-sm opacity-80">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
