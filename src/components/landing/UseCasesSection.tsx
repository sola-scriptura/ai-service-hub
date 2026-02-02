import { useState } from 'react';

interface UseCaseData {
  key: string;
  label: string;
  icon: JSX.Element;
  title: JSX.Element;
  description: string;
  stats: { value: string; label: string }[];
  mockupRows: { icon: JSX.Element; badge: string }[];
}

const useCases: UseCaseData[] = [
  {
    key: 'vibecoders',
    label: 'Vibe Coders',
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Vibe Coders</em>
      </>
    ),
    description:
      'Ship AI-generated code with confidence. Senior engineers review your Cursor, v0, Replit, and ChatGPT outputs—fixing bugs, improving architecture, and ensuring security before production.',
    stats: [
      { value: '73%', label: 'fewer bugs in prod' },
      { value: '4hr', label: 'avg code review' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        ),
        badge: '✓ Secure',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        ),
        badge: '✓ Clean',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
        badge: '✓ Fast',
      },
    ],
  },
  {
    key: 'video',
    label: 'Video Editors',
    icon: (
      <svg viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Video Editors</em>
      </>
    ),
    description:
      'Professional editors polish AI-generated video from Runway, Pika, HeyGen, and Descript. Color grading, pacing, audio mixing, and seamless transitions—broadcast-ready quality.',
    stats: [
      { value: '12hr', label: 'avg video turnaround' },
      { value: '4K', label: 'export quality' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        ),
        badge: '✓ Color graded',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
        badge: '✓ Audio mixed',
      },
    ],
  },
  {
    key: 'design',
    label: 'Designers',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Designers</em>
      </>
    ),
    description:
      'Senior designers refine AI-generated visuals from Midjourney, DALL-E, Figma AI, and Canva. Brand consistency, typography fixes, layout polish, and production-ready exports.',
    stats: [
      { value: '100%', label: 'brand compliant' },
      { value: '8hr', label: 'avg design review' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
            <line x1="9.69" y1="8" x2="21.17" y2="8" />
          </svg>
        ),
        badge: '✓ On-brand',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        ),
        badge: '✓ Typography',
      },
    ],
  },
  {
    key: 'legal',
    label: 'Legal Teams',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Legal Teams</em>
      </>
    ),
    description:
      'Licensed attorneys review AI-generated contracts, compliance docs, and briefs. Every clause checked, every risk flagged. HIPAA-ready on all plans.',
    stats: [
      { value: '$2.4M', label: 'avg risk avoided' },
      { value: '98%', label: 'compliance rate' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
        badge: '✓ Compliant',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
        badge: '✓ Verified',
      },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Marketing</em>
      </>
    ),
    description:
      'Professional copywriters humanize AI content for authentic voice, brand alignment, and SEO. Ship content that actually converts.',
    stats: [
      { value: '340%', label: 'avg traffic increase' },
      { value: '2.5x', label: 'engagement lift' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        ),
        badge: '✓ Human voice',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ),
        badge: '✓ SEO ready',
      },
    ],
  },
  {
    key: 'academic',
    label: 'Academic',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Academic</em>
      </>
    ),
    description:
      'PhD-level experts verify methodology, check citations, format for journal submission, and ensure academic integrity. Get published faster with confidence.',
    stats: [
      { value: '94%', label: 'first-submit acceptance' },
      { value: '48hr', label: 'paper turnaround' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        ),
        badge: '✓ Citations verified',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
        badge: '✓ Journal ready',
      },
    ],
  },
  {
    key: 'creators',
    label: 'Creators',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: (
      <>
        eydits for <em>Creators</em>
      </>
    ),
    description:
      'Turn AI drafts into polished scripts, captions, and newsletters. Your voice, amplified. Create more content, stress less about quality.',
    stats: [
      { value: '3x', label: 'content output' },
      { value: '100%', label: 'on-brand' },
    ],
    mockupRows: [
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        badge: '✓ Your voice',
      },
      {
        icon: (
          <svg viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
        badge: '✓ Newsletter ready',
      },
    ],
  },
];

const UseCasesSection = () => {
  const [activeTab, setActiveTab] = useState('vibecoders');

  return (
    <section className="usecases-section" id="usecases">
      <div className="usecases-inner">
        <div className="section-header">
          <div className="section-label">Use Cases</div>
          <h2 className="section-title">Built for how you work</h2>
        </div>
        <div className="usecases-tabs" role="tablist">
          {useCases.map((uc) => (
            <button
              key={uc.key}
              className={`usecase-tab${activeTab === uc.key ? ' active' : ''}`}
              data-tab={uc.key}
              role="tab"
              aria-selected={activeTab === uc.key}
              onClick={() => setActiveTab(uc.key)}
            >
              {uc.label}
            </button>
          ))}
        </div>

        {useCases.map((uc) => (
          <div
            key={uc.key}
            className={`usecase-content${activeTab === uc.key ? ' active' : ''}`}
            id={`panel-${uc.key}`}
            role="tabpanel"
          >
            <div className="usecase-grid">
              <div className="usecase-info">
                <div className="usecase-icon">{uc.icon}</div>
                <h3>{uc.title}</h3>
                <p>{uc.description}</p>
                <div className="usecase-stats">
                  {uc.stats.map((stat, i) => (
                    <div key={i} className="usecase-stat">
                      <div className="usecase-stat-value">{stat.value}</div>
                      <div className="usecase-stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="usecase-visual">
                <div className="usecase-mockup">
                  <div className="mockup-header">
                    <div className="mockup-dot"></div>
                    <div className="mockup-dot"></div>
                    <div className="mockup-dot"></div>
                  </div>
                  <div className="mockup-rows">
                    {uc.mockupRows.map((row, i) => (
                      <div key={i} className="mockup-row">
                        <div className="mockup-icon-box">{row.icon}</div>
                        <div className="mockup-lines">
                          <div className="mockup-line"></div>
                          <div className="mockup-line"></div>
                        </div>
                        <span className="mockup-badge">{row.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UseCasesSection;
