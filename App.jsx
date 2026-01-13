import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [price, setPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminWaitlist, setAdminWaitlist] = useState([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        setPrice(data.bitcoin.usd);
        setPriceChange(data.bitcoin.usd_24h_change);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const getMood = () => {
    if (priceChange > 2) return 'happy';
    if (priceChange < -2) return 'sad';
    return 'neutral';
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
      const newEntry = {
        email,
        date: new Date().toISOString()
      };
      waitlist.push(newEntry);
      localStorage.setItem('waitlist', JSON.stringify(waitlist));
      
      alert('Thanks for joining the waitlist! We\'ll be in touch soon.');
      setEmail('');
      setShowWaitlist(false);
    } catch (error) {
      console.error('Error saving to waitlist:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'bitcoinmood2024') {
      const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
      setAdminWaitlist(waitlist);
      setShowAdmin(true);
      setShowPasswordPrompt(false);
    } else {
      alert('Incorrect password');
    }
  };

  const copyAllEmails = () => {
    const emails = adminWaitlist.map(entry => entry.email).join(', ');
    navigator.clipboard.writeText(emails);
    alert('Emails copied to clipboard!');
  };

  const exportCSV = () => {
    const csv = 'Email,Date\n' + adminWaitlist.map(entry => 
      `${entry.email},${new Date(entry.date).toLocaleString()}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitcoinmood-waitlist.csv';
    a.click();
  };

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Waitlist Admin</h2>
            <button
              onClick={() => setShowAdmin(false)}
              className="text-gray-600 hover:text-gray-800 font-semibold"
            >
              Close
            </button>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="text-blue-800 font-semibold">
              Total Signups: {adminWaitlist.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={copyAllEmails}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              📋 Copy All Emails
            </button>
            <button
              onClick={exportCSV}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              📊 Export CSV
            </button>
          </div>

          {adminWaitlist.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">#</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Email</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {adminWaitlist.slice().reverse().map((entry, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">{adminWaitlist.length - index}</td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-800 text-sm break-all">{entry.email}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-xs">
                        {new Date(entry.date).toLocaleDateString()}<br/>
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No signups yet</p>
          )}

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> "Copy All" for quick paste into Gmail/Mailchimp. "Export CSV" for spreadsheets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mood = getMood();
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Phase 2 - Header */}
      <header className="header">
        <div className="logo-container">
          <div className={`logo-orb ${mood}`}></div>
          <h1 className="logo-text">BitcoinMood</h1>
        </div>
        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button onClick={() => setShowWaitlist(true)} className="nav-link pro-link">Go Pro</button>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 pb-28 relative overflow-hidden grid-background" style={{ backgroundColor: '#F5F5F5' }}>
        {/* Animated background circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white opacity-30 rounded-full blur-3xl float-animation" aria-hidden="true"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white opacity-30 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}} aria-hidden="true"></div>
        
        {/* Main Content */}
        <main className="text-center mb-8 z-10 w-full max-w-2xl" style={{ marginTop: '60px' }}>
          <article>
            {/* Abstract Mood Orb */}
            <div className="mood-orb-container" role="img" aria-label={`Bitcoin is feeling ${mood}`}>
              <div className="data-ring ring-1"></div>
              <div className="data-ring ring-2"></div>
              <div className={`mood-orb ${mood}`}></div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-200 mx-auto max-w-md">
              <h2 className="text-4xl font-bold mb-4 capitalize" style={{ color: '#0A0A0A' }}>{mood}</h2>
              <div className="text-3xl font-bold mb-2 tracking-tight" style={{ color: '#0A0A0A' }} aria-live="polite">
                <span className="sr-only">Current Bitcoin price:</span>
                ${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xl font-bold inline-block px-4 py-1 rounded-full`} aria-live="polite" style={{
                backgroundColor: isPositive ? '#39FF14' : '#FF1744',
                color: isPositive ? '#0A0A0A' : '#FFFFFF',
                boxShadow: isPositive ? '0 4px 20px rgba(57, 255, 20, 0.3)' : '0 4px 20px rgba(255, 0, 51, 0.3)'
              }}>
                <span className="sr-only">24 hour change:</span>
                {isPositive ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>
          </article>
        </main>

        {/* CTA Section */}
        {!showPayment && (
          <section className="z-10 mb-8 relative" style={{ maxWidth: '600px', margin: '0 auto 2rem', padding: '0 1rem' }}>
            <div className="cta-orb cta-orb-1"></div>
            <div className="cta-orb cta-orb-2"></div>
            <div className="cta-orb cta-orb-3"></div>
            <button
              onClick={() => setShowPayment(true)}
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #39FF14 0%, #2DE00D 100%)',
                color: '#FFFFFF',
                fontWeight: '700',
                padding: '2rem 3rem',
                borderRadius: '20px',
                boxShadow: '0 12px 40px rgba(57, 255, 20, 0.5), 0 0 80px rgba(57, 255, 20, 0.3)',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                fontSize: '1.125rem',
                textTransform: 'uppercase',
                letterSpacing: '0',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                cursor: 'pointer',
                transform: 'scale(1.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 60px rgba(57, 255, 20, 0.6), 0 0 100px rgba(57, 255, 20, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(0)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(57, 255, 20, 0.5), 0 0 80px rgba(57, 255, 20, 0.3)';
              }}
            >
              <span style={{ 
                position: 'relative',
                zIndex: 10,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}>SEE TOMORROW'S MOOD FORECAST</span>
            </button>
          </section>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4 py-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPayment(false)}></div>
            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-3" style={{ color: '#0A0A0A' }}>Tomorrow's Mood</h3>
                <p className="text-gray-600 mb-6">Get Bitcoin's predicted mood for tomorrow</p>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
                  <div className="text-5xl mb-3">🔮</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">One-Time Purchase</p>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#10B981' }}>$2</div>
                  <p className="text-sm text-gray-600">Instant access to tomorrow's forecast</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">✅</span>
                  <p className="text-sm text-gray-700">See tomorrow's predicted Bitcoin mood</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">✅</span>
                  <p className="text-sm text-gray-700">Based on historical patterns & cycles</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">✅</span>
                  <p className="text-sm text-gray-700">Instant delivery via email</p>
                </div>
              </div>

              <stripe-buy-button
                buy-button-id="buy_btn_1QpTa3RrM2FnYAhFQ1eJTvJJ"
                publishable-key="pk_live_51QpT9XRrM2FnYAhF6lz31DfCmOLx7xfRmqDyghJAGbBswhPW7JLKLXhcPhgUfL7M3HLHmgqoaJGOTMQgdkSVNv1J00VgaLbAGB"
              ></stripe-buy-button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        )}

        {/* Waitlist Modal */}
        {showWaitlist && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowWaitlist(false)}></div>
            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <button
                onClick={() => setShowWaitlist(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-3" style={{ color: '#0A0A0A' }}>Join Pro Waitlist</h3>
                <p className="text-gray-600">Be the first to know when BitcoinMood Pro launches</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-xl">⭐</span>
                  <p className="text-sm text-gray-700"><strong>Phenom of the Week</strong> - Get featured to thousands</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-xl">📊</span>
                  <p className="text-sm text-gray-700"><strong>DCA Calculator</strong> - Smart investment strategies</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-xl">📈</span>
                  <p className="text-sm text-gray-700"><strong>7-Day Forecasts</strong> - See the week ahead</p>
                </div>
              </div>

              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Join Waitlist
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Starting at $15/month • No credit card required
              </p>
            </div>
          </div>
        )}

        {/* Admin Password Prompt */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPasswordPrompt(false)}></div>
            <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Admin Access</h3>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <button
                onClick={handleAdminLogin}
                className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Phase 2 - Feature Cards Section */}
      <section className="features-section" id="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-star"></div>
            </div>
            <h3 className="feature-title">Phenom of the Week</h3>
            <p className="feature-description">Get featured to thousands of Bitcoin enthusiasts. Build your brand and grow your following in the community.</p>
            <a href="#" className="feature-link">Learn more</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-calculator"></div>
            </div>
            <h3 className="feature-title">DCA Calculator</h3>
            <p className="feature-description">Smart dollar-cost averaging strategies based on 10 years of historical halving cycle data and market patterns.</p>
            <a href="#" className="feature-link">View calculator</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-chart">
                <div className="icon-chart-middle"></div>
              </div>
            </div>
            <h3 className="feature-title">7-Day Forecasts</h3>
            <p className="feature-description">See the week ahead with mood predictions based on historical patterns, halving cycles, and market analysis.</p>
            <a href="#" className="feature-link">See forecasts</a>
          </div>
        </div>
      </section>

      {/* Phase 2 - Pro Section */}
      <section className="pro-section" id="pricing">
        <h2>BitcoinMood Pro</h2>
        <p>Advanced mood analytics, historical data, and premium features for serious Bitcoin investors.</p>
        <button onClick={() => setShowWaitlist(true)} className="pro-button">
          Join Waitlist • Starting at $15/month
        </button>
      </section>

      {/* Phase 2 - Footer */}
      <footer className="footer">
        <p><strong>For entertainment only</strong> • Not financial advice • Data updated every minute</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy & Terms</a>
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
      </footer>

      {/* Hidden Admin Trigger */}
      <div
        onClick={() => setShowPasswordPrompt(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          width: '20px',
          height: '20px',
          opacity: 0,
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default App;
