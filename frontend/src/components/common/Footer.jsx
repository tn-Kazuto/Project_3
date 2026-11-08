import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="luxury-footer py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* Brand & Chef Bio */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="font-monospace fw-bold text-uppercase" style={{ letterSpacing: '0.15em', color: 'var(--dp-color-accent, #b69355)', fontSize: '0.85rem' }}>[ATELIER]</span>
              <h4 className="m-0 brand-font">Chef James Thew</h4>
            </div>
            <p className="small footer-text mb-3">
              5-Star Executive Hotel Chef, bestselling cookbook author, and television culinary host.
              Sharing culinary excellence, chef secrets, and weekend hands-on classes.
            </p>
            <div className="d-flex flex-column gap-2 small footer-text">
              <div className="d-flex align-items-center gap-2">
                <span className="font-monospace text-muted" style={{ fontSize: '0.75rem' }}>STUDIO:</span>
                <span>The Grand Palace Culinary Studio, Suite 500</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="font-monospace text-muted" style={{ fontSize: '0.75rem' }}>HOURS:</span>
                <span>Weekend Cooking Classes: Sat & Sun (10 AM - 3 PM)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-uppercase mb-3 small">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0">
              <li><Link to="/recipes" className="footer-link">All Recipes & Tips</Link></li>
              <li><Link to="/contests" className="footer-link">Cooking Contests</Link></li>
              <li><Link to="/announcements" className="footer-link">Announcements</Link></li>
              <li><Link to="/faqs" className="footer-link">Help & FAQs</Link></li>
            </ul>
          </div>

          {/* Membership & Aptech Note */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="fw-bold text-uppercase mb-3 small">Membership</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0">
              <li><Link to="/register" className="footer-link">Monthly Plan ($10/mo)</Link></li>
              <li><Link to="/register" className="footer-link">Yearly Plan ($100/yr)</Link></li>
              <li><Link to="/feedback" className="footer-link">Give Site Feedback</Link></li>
              <li><Link to="/login" className="footer-link">Member Login</Link></li>
            </ul>
          </div>

          {/* Aptech Project Footer */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase mb-3 small">eProject Aptech</h6>
            <p className="small footer-text mb-2">
              Website Chia Sẻ Công Thức Nấu Ăn & Cuộc Thi Ẩm Thực - Chef James Thew.
            </p>
            <div className="p-3 bg-dark border border-secondary border-opacity-25 small text-white-50">
              <span className="badge bg-warning text-dark me-2">Aptech</span>
              Enterprise Lab Standard
            </div>
          </div>
        </div>

        <div className="ruled-row my-4 border-secondary opacity-25"></div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small footer-text">
          <span>&copy; {new Date().getFullYear()} Chef James Thew. All rights reserved.</span>
          <span>Architectural Luxury Design System &middot; Culinary Precision</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
