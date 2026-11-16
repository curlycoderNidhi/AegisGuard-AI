import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Mail, AlertTriangle, Send } from 'lucide-react';


export default function App() {
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/analyze/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, subject, body }),
      });

      if (!response.ok) throw new Error('Failed to connect to AegisGuard AI backend.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <ShieldAlert className="w-10 h-10 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AegisGuard AI Dashboard</h1>
          <p className="text-sm text-slate-400">Automated Phishing & Threat Intelligence Platform</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" /> Simulate Incoming Email
          </h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Sender Email</label>
              <input
                type="text"
                placeholder="e.g. support@paypal-secure-update.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                placeholder="e.g. Urgent: Account Suspended"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Email Body</label>
              <textarea
                rows="4"
                placeholder="Paste email content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {loading ? 'Analyzing Threat...' : 'Analyze Threat'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>

        {/* Results Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-4">Threat Intelligence Output</h2>
            {result ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg flex items-center justify-between border ${
                  result.is_phishing ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'
                }`}>
                  <div className="flex items-center gap-3">
                    {result.is_phishing ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    <div>
                      <p className="font-bold">{result.is_phishing ? 'Phishing Threat Detected' : 'Email Verified Safe'}</p>
                      <p className="text-xs opacity-80">Risk Score: {(result.risk_score * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Detected Indicators</h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                    {result.detected_indicators.map((ind, idx) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Automated Recommendation</h3>
                  <p className="text-sm bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <ShieldAlert className="w-12 h-12 mb-2 opacity-30" />
                <p>Submit an email payload on the left to view real-time AI security diagnostics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}