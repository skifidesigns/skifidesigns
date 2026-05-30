import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Loader2, FileText, Calendar, Download, Upload, Building2,
  Package, CheckCircle2, Clock, AlertCircle, Sparkles, Send, MessageCircle, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './icons/GoogleIcon';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const formatDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return ''; }
};
const formatBytes = (b) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const StatusPill = ({ payment_status, status }) => {
  let label = 'Pending', cls = 'bg-yellow-500/15 text-yellow-600', Icon = Clock;
  if (payment_status === 'paid' && status === 'completed') {
    label = 'Completed'; cls = 'bg-emerald-600/15 text-emerald-700'; Icon = CheckCircle2;
  } else if (payment_status === 'paid' && status === 'delivered') {
    label = 'Delivered'; cls = 'bg-green-500/15 text-green-600'; Icon = CheckCircle2;
  } else if (payment_status === 'paid' && status === 'revision_requested') {
    label = 'Revision Requested'; cls = 'bg-amber-500/15 text-amber-600'; Icon = AlertCircle;
  } else if (payment_status === 'paid') {
    label = 'In Progress'; cls = 'bg-[#2A7AFE]/15 text-[#2A7AFE]'; Icon = Sparkles;
  } else if (payment_status === 'failed' || payment_status === 'expired') {
    label = 'Failed'; cls = 'bg-red-500/15 text-red-600'; Icon = AlertCircle;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const downloadAuth = async (file_id, filename) => {
  try {
    const resp = await axios.get(`${API}/me/files/${file_id}`, {
      withCredentials: true,
      responseType: 'blob',
    });
    const url = URL.createObjectURL(resp.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'file';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    toast.error(`Could not download ${filename}`);
  }
};

const assetUrl = (u) => {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${process.env.REACT_APP_BACKEND_URL}${u.startsWith('/') ? u : '/' + u}`;
};

const LibraryCard = ({ item }) => {
  const handleDownload = () => {
    if (!item.download_url) {
      toast.error('Download link unavailable - try again later');
      return;
    }
    const a = document.createElement('a');
    a.href = assetUrl(item.download_url);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${item.title}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" data-testid={`library-item-${item.id}`}>
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        {item.thumbnail_url ? (
          <img src={assetUrl(item.thumbnail_url)} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${item.unlock_kind === 'paid' ? 'text-[#2A7AFE]' : 'text-green-600'}`}>
            {item.unlock_kind === 'paid' ? `$${item.price} - Paid` : 'Free'}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-3 flex-grow">{item.title}</h3>
        <Button
          size="sm"
          onClick={handleDownload}
          data-testid={`library-download-${item.id}`}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download
        </Button>
      </div>
    </div>
  );
};

const FileItem = ({ file, accent = '#2A7AFE' }) => (
  <li className="flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-2.5">
    <FileText className="w-4 h-4 shrink-0" style={{ color: accent }} />
    <div className="flex-grow min-w-0">
      <p className="text-sm font-medium text-foreground truncate" title={file.filename}>{file.filename}</p>
      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
    </div>
    <button
      onClick={() => downloadAuth(file.file_id, file.filename)}
      data-testid={`download-${file.file_id}`}
      aria-label="Download"
      className="p-1.5 rounded-md hover:bg-[#2A7AFE]/10 text-[#2A7AFE]"
    >
      <Download className="w-4 h-4" />
    </button>
  </li>
);

const OrderCard = ({ order, onReload }) => {
  const [uploading, setUploading] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState('');
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleAdditionalUpload = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 50 MB`);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append('file', file);
        await axios.post(`${API}/me/orders/${order.session_id}/upload`, fd, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${file.name} added to project brief`);
      } catch (err) {
        toast.error(err?.response?.data?.detail || `Could not upload ${file.name}`);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    onReload?.();
  };

  const submitRevision = async () => {
    setRevisionSubmitting(true);
    try {
      await axios.post(
        `${API}/me/orders/${order.session_id}/revision-request`,
        { message: revisionMsg.trim() },
        { withCredentials: true },
      );
      toast.success('Revision request sent. Our team will follow up shortly.');
      setRevisionOpen(false);
      setRevisionMsg('');
      onReload?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not submit revision request');
    } finally {
      setRevisionSubmitting(false);
    }
  };

  const markComplete = async () => {
    if (!window.confirm("Mark this project as complete? You won't be able to request further revisions.")) return;
    try {
      await axios.post(
        `${API}/me/orders/${order.session_id}/complete`,
        {},
        { withCredentials: true },
      );
      toast.success('Project marked as complete. Thank you!');
      onReload?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not mark as complete');
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-5" data-testid={`order-card-${order.session_id}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#2A7AFE] font-semibold mb-1.5">
            {order.package_id === 'per_slide' ? 'Per Slide Project' : 'Monthly Retainer'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{order.project_type}</h2>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Ordered {formatDate(order.created_at)} · {order.timeline}
            {order.slide_count ? ` · ${order.slide_count} slides` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill payment_status={order.payment_status} status={order.status} />
          <p className="text-base font-semibold text-foreground">
            ${order.amount?.toFixed(2)} <span className="text-xs text-muted-foreground uppercase">{order.currency}</span>
          </p>
        </div>
      </div>

      {/* Description */}
      {order.description && (
        <div className="bg-background border border-border rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap">
          {order.description}
        </div>
      )}

      {/* Deliveries from us */}
      {order.deliveries?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <p className="text-xs uppercase tracking-[0.16em] text-green-600 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Delivered by SkiFi
            </p>
            {order.status === 'delivered' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRevisionOpen(true)}
                  data-testid={`request-revision-${order.session_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Request a revision
                </button>
                <span className="text-muted-foreground/40 text-xs">|</span>
                <button
                  onClick={markComplete}
                  data-testid={`mark-complete-${order.session_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as complete
                </button>
              </div>
            )}
            {order.status === 'revision_requested' && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  Revision in progress
                </span>
                <span className="text-muted-foreground/40 text-xs">|</span>
                <button
                  onClick={markComplete}
                  data-testid={`mark-complete-${order.session_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as complete
                </button>
              </div>
            )}
            {order.status === 'completed' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>
          <div className="space-y-4">
            {order.deliveries.map((d) => (
              <div key={d.id} className="bg-green-500/5 border border-green-500/30 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {formatDate(d.created_at)}
                </p>
                {d.message && (
                  <p className="text-sm text-foreground whitespace-pre-wrap mb-3">{d.message}</p>
                )}
                {d.files?.length > 0 && (
                  <ul className="space-y-2" data-testid={`delivery-files-${d.id}`}>
                    {d.files.map((f) => <FileItem key={f.file_id} file={f} accent="#10b981" />)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brief files */}
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Your project brief & assets
        </p>
        {order.brief_files?.length > 0 ? (
          <ul className="space-y-2 mb-3" data-testid={`brief-files-${order.session_id}`}>
            {order.brief_files.map((f) => <FileItem key={f.file_id} file={f} />)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">No files uploaded yet.</p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-testid={`add-brief-${order.session_id}`}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading…' : 'Add more files'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleAdditionalUpload(e.target.files)}
        />
      </div>

      {/* Revision request modal */}
      {revisionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => !revisionSubmitting && setRevisionOpen(false)}
          data-testid={`revision-modal-${order.session_id}`}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-500" />
                  Request a revision
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tell us what to adjust - our team will get back to you.
                </p>
              </div>
              <button
                onClick={() => setRevisionOpen(false)}
                disabled={revisionSubmitting}
                className="p-1.5 rounded-md hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={revisionMsg}
              onChange={(e) => setRevisionMsg(e.target.value)}
              placeholder="e.g. Please make the cover slide darker, swap the founder photo on slide 4, and shorten the intro section."
              maxLength={2000}
              rows={5}
              className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-[#2A7AFE]"
              data-testid="revision-message"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{revisionMsg.length}/2000</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevisionOpen(false)}
                disabled={revisionSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={submitRevision}
                disabled={revisionSubmitting}
                data-testid="revision-submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {revisionSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClientDashboard = () => {
  const { user, loading: authLoading, login } = useAuth();
  const [orders, setOrders] = useState([]);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, libraryRes] = await Promise.all([
        axios.get(`${API}/me/orders`, { withCredentials: true }),
        axios.get(`${API}/me/library`, { withCredentials: true }).catch(() => ({ data: { items: [] } })),
      ]);
      setOrders(ordersRes.data.items || []);
      setLibrary(libraryRes.data.items || []);
    } catch {
      toast.error('Could not load your dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'My Dashboard | SkiFi Designs';
    if (user) load();
  }, [user, load]);

  if (authLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="flex justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-[#2A7AFE]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-10 text-center">
            <Package className="w-12 h-12 mx-auto text-[#2A7AFE] mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Client Dashboard</h1>
            <p className="text-muted-foreground mb-6">
              Sign in with the Google account you used to order - instantly see your projects and download deliveries.
            </p>
            <button
              onClick={login}
              data-testid="dashboard-google-login"
              className="w-full py-3 rounded-xl bg-white text-gray-900 font-semibold flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.02] shadow-sm"
            >
              <GoogleIcon className="w-5 h-5" />
              Continue with Google
            </button>
            <p className="text-xs text-muted-foreground mt-5">
              Don't have an order yet?{' '}
              <a href="/" className="text-[#2A7AFE] underline">Start a project →</a>
            </p>
          </div>
        </section>
        <Footer />
        <FloatingContact />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <section className="pt-28 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-2">My Dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Hi {user.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as <span className="text-foreground">{user.email}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={load}
              disabled={loading}
              data-testid="dashboard-refresh"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <span className="mr-2">↻</span>}
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-[#2A7AFE]" />
            </div>
          ) : (
            <>
              {/* Section 1 - Projects */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#2A7AFE]" />
                  My Projects
                  <span className="text-xs text-muted-foreground font-normal">({orders.length})</span>
                </h2>
              </div>
              {orders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center mb-12" data-testid="dashboard-empty">
                  <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-60" />
                  <p className="text-muted-foreground mb-5">
                    Once you place an order using this email, project status and file deliveries appear here.
                  </p>
                  <Button asChild className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white">
                    <a href="/">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start a project
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 mb-12" data-testid="dashboard-orders">
                  {orders.map((o) => (
                    <OrderCard key={o.session_id} order={o} onReload={load} />
                  ))}
                </div>
              )}

              {/* Section 2 - Digital Products / Library */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2A7AFE]" />
                  My Library
                  <span className="text-xs text-muted-foreground font-normal">({library.length})</span>
                </h2>
                {library.length > 0 && (
                  <a href="/resources" className="text-xs text-[#2A7AFE] hover:underline">
                    Browse more →
                  </a>
                )}
              </div>
              {library.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center" data-testid="library-empty">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-60" />
                  <p className="text-muted-foreground mb-5">
                    Free + paid templates you download will live here for unlimited re-downloads.
                  </p>
                  <Button asChild variant="outline">
                    <a href="/resources">Browse templates</a>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="dashboard-library">
                  {library.map((t) => (
                    <LibraryCard key={t.id} item={t} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default ClientDashboard;
