import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { faqApi } from '../../services/api';

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
      {/* Header Banner - Pale Taupe Architectural Panel with Culinary Scrim */}
      <div 
        className="field-taupe p-4 p-md-5 mb-5 text-center position-relative overflow-hidden"
        style={{
          backgroundColor: 'var(--dp-color-ground-2)',
          border: '1px solid var(--dp-color-panel-line)',
          backgroundImage: 'linear-gradient(rgba(244, 240, 234, 0.92), rgba(244, 240, 234, 0.96)), url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="roman-numeral mb-2">VII &middot; INQUIRIES & GUIDANCE</div>
        <h1 className="brand-font display-5 mb-3">Frequently Asked Questions</h1>
        <p className="lead max-w-700 mx-auto" style={{ color: 'var(--dp-color-ink-2)' }}>
          Find answers to common inquiries about culinary memberships, recipe access, cooking contests, and weekend masterclasses with Chef James Thew.
        </p>

        {/* Quick Topic Chips (Visual Filter Buttons to jump or filter without reading all text) */}
        <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
          {['All Inquiries', 'Subscription', 'Contest', 'Recipe', 'Masterclass'].map((topic) => {
            const isAll = topic === 'All Inquiries';
            const isActive = isAll ? searchQuery === '' : searchQuery.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                type="button"
                className="btn btn-sm font-monospace text-uppercase"
                style={{
                  backgroundColor: isActive ? 'var(--dp-color-field)' : '#ffffff',
                  color: isActive ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                  border: '1px solid var(--dp-color-rule)',
                  borderRadius: 0,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                }}
                onClick={() => setSearchQuery(isAll ? '' : topic)}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="max-w-600 mx-auto mt-3">
          <input
            type="text"
            className="form-control form-control-lg text-center"
            placeholder="Search questions (e.g. subscription, contest, cancel)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
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
                          <span className="font-monospace small text-muted flex-shrink-0 ms-2">
                            {isOpen ? '[-]' : '[+]'}
                          </span>
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
                  Send Us a Message
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
