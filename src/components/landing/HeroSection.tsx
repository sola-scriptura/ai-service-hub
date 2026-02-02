import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const demoPanels = {
  legal: {
    before: {
      text: (
        <>
          Contractor shall deliver "satisfactory" work. Client may terminate{' '}
          <span className="error">at any time for any reason</span>. Payment due{' '}
          <span className="error">upon completion</span>.
        </>
      ),
      tags: ['Unenforceable terms', '$0 kill fee exposure'],
    },
    after: {
      text: 'Deliverables per Exhibit A. Termination requires 30-day notice + payment for work completed. 50% due at signing, 50% on delivery.',
      tags: ['✓ Enforceable in court', '✓ Revenue protected'],
    },
  },
  code: {
    before: {
      text: (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          <span className="error">{'const query = `SELECT * FROM'}</span>
          <br />
          <span className="error">{'users WHERE id = ${userId}`'}</span>
          <br />
          db.execute(query)
        </span>
      ),
      tags: ['SQL injection vulnerability', 'Data breach risk'],
      isCode: true,
    },
    after: {
      text: (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {'const query = `SELECT * FROM'}
          <br />
          {'users WHERE id = $1`'}
          <br />
          db.execute(query, [userId])
        </span>
      ),
      tags: ['✓ Secure parameterized query', '✓ Ship to prod safely'],
      isCode: true,
    },
  },
  blog: {
    before: {
      text: (
        <>
          <span className="error">Unlock the power of</span> our innovative platform. We're{' '}
          <span className="error">excited to announce</span> features that will{' '}
          <span className="error">revolutionize</span> your workflow.
        </>
      ),
      tags: ['Detectable AI voice', 'Zero brand personality'],
    },
    after: {
      text: "You asked, we built it. Three features dropping today that'll cut your reporting time in half. No fluff—here's what changed.",
      tags: ['✓ Sounds human', '✓ Converts 2.3x better'],
    },
  },
  video: {
    before: {
      text: (
        <>
          <span className="error">Hand morphs at 0:34</span>, audio peaks at{' '}
          <span className="error">-1dB (clipping)</span>, 23.976fps mixed with{' '}
          <span className="error">30fps B-roll</span>, no color consistency.
        </>
      ),
      tags: ['Client will reject', 'Platform will flag'],
    },
    after: {
      text: 'Clean compositing, audio at -6dB LUFS, frame rate matched, rec709 LUT applied. Exports for YouTube, TikTok, and broadcast specs included.',
      tags: ['✓ Client-ready', '✓ Platform-optimized'],
    },
  },
  research: {
    before: {
      text: (
        <>
          Results were <span className="error">highly significant</span> (p=0.048).{' '}
          <span className="error">This proves</span> our hypothesis. Sample size was{' '}
          <span className="error">adequate</span> for the analysis.
        </>
      ),
      tags: ['Peer reviewers will reject', 'Missing effect size'],
    },
    after: {
      text: 'A medium effect was observed (d=0.58, p=.048, 95% CI [0.02, 1.14]). Power analysis indicated n=64 required; n=71 recruited. Results support H1.',
      tags: ['✓ Publication-ready stats', '✓ Reviewer-proof methods'],
    },
  },
  reports: {
    before: {
      text: (
        <>
          Q3 showed <span className="error">strong growth</span> across segments. Churn{' '}
          <span className="error">remained stable</span>. We recommend{' '}
          <span className="error">continued investment</span> in current initiatives.
        </>
      ),
      tags: ['No actionable data', 'Exec will ask "what\'s the number?"'],
    },
    after: {
      text: 'Q3 revenue: $4.2M (+23% QoQ). Enterprise up 31%, SMB flat. Churn: 4.2% → 3.8%. Recommend: shift $200K from SMB acquisition to Enterprise expansion.',
      tags: ['✓ Board-ready numbers', '✓ Clear recommendation'],
    },
  },
};

const tabLabels: { key: string; label: string }[] = [
  { key: 'legal', label: 'Legal' },
  { key: 'code', label: 'Code' },
  { key: 'blog', label: 'Marketing' },
  { key: 'video', label: 'Video' },
  { key: 'research', label: 'Research' },
  { key: 'reports', label: 'Reports' },
];

const HeroSection = () => {
  const [activeDemo, setActiveDemo] = useState('legal');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingNavigate = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && pendingNavigate.current) {
      pendingNavigate.current = false;
      setAuthModalOpen(false);
      navigate('/start-project');
    }
  }, [user, navigate]);

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      pendingNavigate.current = true;
      setAuthModalOpen(true);
      return;
    }
    navigate('/start-project');
  };

  const handleAuthClose = () => {
    pendingNavigate.current = false;
    setAuthModalOpen(false);
  };

  const panel = demoPanels[activeDemo as keyof typeof demoPanels];

  return (
    <>
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-inner">
        <div className="hero-badge">
          Expert human review for AI outputs
          <span className="hero-badge-highlight">New</span>
        </div>
        <h1>
          AI creates.<br />
          <span className="gradient-text">Humans perfect.</span>
        </h1>
        <p className="hero-sub">
          Ship faster with expert reviewers who transform AI-generated output into polished,
          production-ready deliverables.
        </p>
        <div className="hero-ctas">
          <a href="#" className="btn btn-primary btn-shimmer" onClick={handleStartProject}>
            Start Your First Project
          </a>
          <a href="#how" className="btn btn-secondary">
            See How It Works
          </a>
        </div>
        <div className="hero-social-proof">
          <div className="social-proof-item">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            24-hour turnaround
          </div>
          <div className="social-proof-item">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            99.8% satisfaction
          </div>
          <div className="social-proof-item">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Unlimited revisions
          </div>
        </div>
      </div>

      {/* Hero Demo */}
      <div className="hero-demo">
        <div className="demo-window">
          <div className="demo-toolbar">
            <div className="demo-dot"></div>
            <div className="demo-dot"></div>
            <div className="demo-dot"></div>
            <div className="demo-tabs">
              {tabLabels.map((tab) => (
                <button
                  key={tab.key}
                  className={`demo-tab${activeDemo === tab.key ? ' active' : ''}`}
                  onClick={() => setActiveDemo(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="demo-body">
            <div className="demo-content active">
              <div className="demo-cards">
                <div className="demo-card before">
                  <div className="demo-card-label">AI Draft</div>
                  <div className="demo-card-text">{panel.before.text}</div>
                  <div className="demo-tags">
                    {panel.before.tags.map((tag, i) => (
                      <span key={i} className="demo-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="demo-card after">
                  <div className="demo-card-label">Expert Reviewed</div>
                  <div className="demo-card-text">{panel.after.text}</div>
                  <div className="demo-tags">
                    {panel.after.tags.map((tag, i) => (
                      <span key={i} className="demo-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AuthModal
      open={authModalOpen}
      onClose={handleAuthClose}
      defaultMode="signup"
    />
    </>
  );
};

export default HeroSection;
