import { useNavigate } from 'react-router-dom';

const FooterSection = () => {
  const navigate = useNavigate();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <span className="logo-mark">e</span>
            <span className="logo-text">eydits</span>
          </a>
          <p>Expert human review for AI outputs. Production-ready quality, every time.</p>
        </div>
        <div className="footer-col">
          <h5>Product</h5>
          <ul>
            <li><a href="#">Features</a></li>
            <li><a href="#">Use Cases</a></li>
            <li><a href="#experts">Experts</a></li>
            <li><a href="#">Enterprise</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Press</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Resources</h5>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">API</a></li>
            <li><a href="#">Status</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2025 eydits. All rights reserved.</span>
        <div className="footer-links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
