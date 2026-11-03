import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { faqApi } from '../../services/api';
import { HelpCircle, Search, MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0); // First FAQ open by default

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await faqApi.getAll();
      if (res.data && res.data.success) {
        setFaqs(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load FAQs at this time.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-5">
      {/* Header Banner - Pale Taupe Architectural Panel */}
      <div className="field-taupe p-4 p-md-5 mb-5 text-center">
        <div className="d-inline-flex align-items-center justify-content-center p-3 mb-3 border border-warning" style={{ borderColor: 'var(--dp-color-accent)' }}>
          <HelpCircle size={36} className="luxury-gold-icon" />
        </div>
        <div className="roman-numeral mb-2">VII &middot; INQUIRIES & GUIDANCE</div>
        <h1 className="brand-font display-5 mb-3">Frequently Asked Questions</h1>
        <p className="lead max-w-700 mx-auto" style={{ color: 'var(--dp-color-ink-2)' }}>
          Find answers to common inquiries about culinary memberships, recipe access, cooking contests, and weekend masterclasses with Chef James Thew.
        </p>

        {/* Search Bar with square hairline rule */}
        <div className="max-w-600 mx-auto mt-4">
          <div className="input-group input-group-lg">
            <span className="input-group-text bg-white border-end-0">
              <Search size={20} style={{ color: 'var(--dp-color-accent)' }} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search questions (e.g. subscription, contest, cancel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--dp-color-accent)' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2" style={{ color: 'var(--dp-color-ink-2)' }}>Loading FAQs...</p>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <HelpCircle size={48} className="mb-3 opacity-50" />
                <h5 className="brand-font">No matching questions found</h5>
                <p>Try different keywords or contact us directly.</p>
              </div>
            ) : (
              <div className="accordion custom-faq-accordion" id="faqAccordion">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={faq.faqId || index}
                      className="accordion-item mb-3 bg-white"
                      style={{
                        border: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                        borderRadius: 0,
                      }}
                    >
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${isOpen ? '' : 'collapsed'} py-3 px-4`}
                          type="button"
                          onClick={() => toggleAccordion(index)}
                          style={{
                            backgroundColor: isOpen ? 'var(--dp-color-ground-2)' : '#ffffff',
                            color: 'var(--dp-color-ink)',
                            boxShadow: 'none',
                            borderRadius: 0,
                          }}
                        >
                          <span
                            className="badge me-3 font-monospace"
                            style={{
                              backgroundColor: 'var(--dp-color-field)',
                              color: 'var(--dp-color-on-field)',
                              borderRadius: 0,
                            }}
                          >
                            Q{faq.displayOrder || index + 1}
                          </span>
                          <span className="flex-grow-1 text-start fw-medium" style={{ fontFamily: 'var(--dp-typography-serif)', fontSize: '1.15rem' }}>
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={20} className="luxury-gold-icon flex-shrink-0" />
                          ) : (
                            <ChevronDown size={20} className="text-muted flex-shrink-0" />
                          )}
                        </button>
                      </h2>
                      {isOpen && (
                        <div className="accordion-collapse show">
                          <div
                            className="accordion-body px-4 py-4"
                            style={{
                              backgroundColor: 'var(--dp-color-ground)',
                              color: 'var(--dp-color-ink-2)',
                              lineHeight: '1.75',
                              borderTop: '1px solid var(--dp-color-rule)',
                            }}
                          >
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Need More Help Box - Architectural Charcoal Ground with Fine Gold Accent */}
            <div
              className="card mt-5 p-4 p-md-5 text-center"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              <div className="card-body p-0">
                <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)' }}>
                  DIRECT CONCIERGE
                </div>
                <h3 className="brand-font mb-2 text-white" style={{ fontSize: '1.85rem' }}>
                  Have a question not listed here?
                </h3>
                <p className="mb-4 mx-auto max-w-600" style={{ color: 'var(--dp-color-on-field-2)', fontSize: '0.95rem' }}>
                  Feel free to send your inquiry or culinary feedback directly to Chef James Thew.
                </p>
                <Link
                  to="/feedback"
                  className="btn btn-warning text-white fw-bold px-4 py-3"
                  style={{
                    backgroundColor: 'var(--dp-color-accent)',
                    borderColor: 'var(--dp-color-accent)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    borderRadius: 0,
                  }}
                >
                  <MessageSquare size={18} className="me-2 inline" /> Send Us a Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqPage;
