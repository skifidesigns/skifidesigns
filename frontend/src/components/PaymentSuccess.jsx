import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('checking'); // checking | paid | failed | expired | error
  const [details, setDetails] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    const maxAttempts = 7;
    const pollInterval = 2000;

    const poll = async (n) => {
      if (cancelled) return;
      try {
        const { data } = await axios.get(`${API}/payments/status/${sessionId}`);
        setDetails(data);
        setAttempts(n);

        if (data.payment_status === 'paid') {
          setStatus('paid');
          // Fire GA4 purchase event exactly once
          if (!purchaseTrackedRef.current) {
            purchaseTrackedRef.current = true;
            trackEvent('purchase', {
              transaction_id: sessionId,
              value: Number(data.amount) || 0,
              currency: (data.currency || 'usd').toUpperCase(),
              items: data.package_id ? [{ item_id: data.package_id, item_name: data.package_id }] : undefined,
            });
          }
          return;
        }
        if (data.status === 'expired' || data.payment_status === 'expired') {
          setStatus('expired');
          return;
        }
        if (n >= maxAttempts) {
          setStatus('error');
          return;
        }
        setTimeout(() => poll(n + 1), pollInterval);
      } catch {
        if (n >= maxAttempts) {
          setStatus('error');
        } else {
          setTimeout(() => poll(n + 1), pollInterval);
        }
      }
    };

    poll(1);
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-card border border-border rounded-3xl p-10 text-center">
        {status === 'checking' && (
          <>
            <Loader2 className="w-16 h-16 text-[#2A7AFE] mx-auto mb-6 animate-spin" />
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              Confirming your payment…
            </h1>
            <p className="text-muted-foreground">
              Please don't close this page. Attempt {attempts}/7.
            </p>
          </>
        )}

        {status === 'paid' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-3" data-testid="payment-success-title">
              Payment Successful
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you for choosing SkiFi Designs.
            </p>
            {details && (
              <p className="text-sm text-foreground/80 mb-8">
                Amount paid:{' '}
                <span className="font-semibold">
                  ${details.amount} {details.currency?.toUpperCase()}
                </span>
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-8">
              Our team will reach out to you within 24 hours to kick off your project.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A7AFE] hover:bg-[#3B82F6] text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {(status === 'expired' || status === 'error') && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              {status === 'expired' ? 'Session Expired' : 'Status Unavailable'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {status === 'expired'
                ? 'Your checkout session has expired. Please try again.'
                : "We couldn't confirm your payment automatically. If you were charged, our team will reach out within 24 hours."}
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A7AFE] hover:bg-[#3B82F6] text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
