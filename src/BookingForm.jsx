
import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, ExternalLink, ShieldCheck, CheckCircle2, ListFilter, ClipboardCheck } from 'lucide-react';

const BookingForm = ({ onSuccess, webhookUrl, setWebhookUrl }) => {
  const [loading, setLoading] = useState(false);
  const [showExternal, setShowExternal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    address: '',
    unit: '',
    serviceType: 'Standard Turnover',
    lockbox: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      // If no webhook URL is provided, we simulate a successful local submission
      if (!webhookUrl) {
        console.warn("No Webhook URL provided. Simulating local success.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = {
          status: 'success',
          id: 'FIX-' + Math.floor(Math.random() * 10000),
          pdf: '#'
        };
      } else {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: JSON.stringify(formData),
          mode: 'no-cors' // Google Apps Script requires no-cors for simple web apps usually
        });
        
        // Since no-cors doesn't give us the body, in a real scenario you'd use a proxy 
        // or handle the response differently. For this demo, we'll assume success if no error.
        result = {
          status: 'success',
          id: 'FIX-' + Math.floor(Math.random() * 10000),
          pdf: '#'
        };
      }

      const newJob = {
        ...formData,
        id: result.id,
        timestamp: new Date().toLocaleString(),
        status: 'Pending',
        pdfUrl: result.pdf
      };

      onSuccess(newJob);
      setFormData({
        clientName: '',
        clientEmail: '',
        address: '',
        unit: '',
        serviceType: 'Standard Turnover',
        lockbox: '',
      });
      alert(`Booking Successful! Job ID: ${result.id}`);

    } catch (err) {
      console.error(err);
      alert("Error submitting booking. Please check your webhook URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
        <AlertCircle className="shrink-0" />
        <div className="text-sm">
          <p className="font-bold">System Connection</p>
          <p>Automatic PDF generation and sheet logging is active via: <code className="bg-amber-100 px-1 rounded text-xs">{webhookUrl.substring(0, 40)}...</code></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-4 mb-2">
            <button 
              onClick={() => setShowExternal(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${!showExternal ? 'bg-white border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-100 border-transparent text-slate-500 opacity-70'}`}
            >
              <ShieldCheck size={18} /> Internal Form
            </button>
            <button 
              onClick={() => setShowExternal(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${showExternal ? 'bg-white border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-100 border-transparent text-slate-500 opacity-70'}`}
            >
              <ClipboardCheck size={18} /> Legacy Portal (Google Form)
            </button>
          </div>

          {!showExternal ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-800">New Work Order</h2>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Client Name</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="John Property Manager"
                      value={formData.clientName}
                      onChange={e => setFormData({...formData, clientName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Client Email</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="manager@realty.com"
                      value={formData.clientEmail}
                      onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Property Address</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="123 Main St, Springfield"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Unit #</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="4B"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Service Type</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                      value={formData.serviceType}
                      onChange={e => setFormData({...formData, serviceType: e.target.value})}
                    >
                      <option>Standard Turnover</option>
                      <option>Deep Clean + Repair</option>
                      <option>Express (24h)</option>
                      <option>Emergency Service</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Lockbox / Access</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Code: 1234"
                      value={formData.lockbox}
                      onChange={e => setFormData({...formData, lockbox: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  {loading ? 'Submitting...' : 'Confirm Booking & Generate PDF'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <ExternalLink className="text-slate-600" size={20} />
                <h3 className="font-bold text-slate-800">External Booking Portal</h3>
              </div>
              <div className="w-full overflow-hidden flex justify-center">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSfkDtMsm43gX8W2iggUV9bdHy05yJY35HQKbtcQ_45LX9-Xrw/viewform?embedded=true" 
                  width="100%" 
                  height="2557" 
                  frameBorder="0" 
                  marginHeight="0" 
                  marginWidth="0"
                  className="w-full"
                >
                  Loading…
                </iframe>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
              <ExternalLink size={18} /> API Configuration
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Google Webhook URL</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                  placeholder="https://script.google.com/..."
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400">
                Found in your Apps Script project under <strong>Deploy &gt; Web App</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Service Details</h3>
            <ul className="space-y-3">
              {[
                "Full professional cleaning",
                "Appliance diagnostic check",
                "Wall patching & paint touch-up",
                "Trash out services included",
                "Photo report generated"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
