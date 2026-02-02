import { FooterColumn } from '@/types';

export const footerColumns: FooterColumn[] = [
  {
    title: 'Services',
    links: [
      { label: 'Documents & Compliance', href: '/services/documents-compliance' },
      { label: 'Content Humanization', href: '/services/content-humanization' },
      { label: 'Video & Audio', href: '/services/video-audio-polish' },
      { label: 'Graphic Design', href: '/services/graphic-design-refinement' },
      { label: 'AI Training', href: '/services/ai-training-optimization' },
      { label: 'Academic Research', href: '/services/academic-research-validation' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'How It Works', href: '#how' },
      { label: 'Experts', href: '#experts' },
      { label: 'Case Studies', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'FAQs', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Refund Policy', href: '#' },
      { label: 'API Documentation', href: '#' },
    ],
  },
];

export const clientLogos = ['TechCorp', 'HealthFirst', 'LegalEdge', 'CreativeHub', 'DataFlow'];
