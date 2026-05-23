import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, RefreshCw, DollarSign, CheckCircle2, Clock,
  Mail, Building2, Calendar, FileText, Search, Lock, Loader2
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'skifi-admin-token';

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const StatusBadge = ({ status }) => {
  const styles = {
    paid: 'bg-green-500/10 text-green-600 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20',
    expired: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status?.toUpperCase()}
    </span>
  );
};

const LoginForm = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, { password });
      localStorage.setItem(TOKEN_KEY, data.token);
      toast.success('Welcome back');
      onSuccess(data.token);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8"
        data-testid="admin-login-form"
      >
        <div className="w-12 h-12 rounded-xl bg-[#2A7AFE]/10 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-[#2A7AFE]" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Admin Access</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the admin password to view orders and submissions.
        </p>

        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium block mb-2">
          Password
        </label>
        <Input
          data-testid="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="bg-background border-border mb-6"
          autoFocus
        />

        <Button
          data-testid="admin-login-submit"
          type="submit"
          disabled={loading || !password}
          className="w-full bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

const Dashboard = ({ token, onLogout }) => {
  const [data, setData] = useState({ items: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?payment_status=${filter}` : '';
      const { data } = await axios.get(`${API}/admin/submissions${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        onLogout();
      } else {
        toast.error('Failed to load submissions');
      }
    } finally {
      setLoading(false);
    }
  }, [token, filter, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = data.items.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.company?.toLowerCase().includes(s) ||
      item.project_type?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">SkiFi Admin</h1>
            <p className="text-xs text-muted-foreground">Onboarding & Payments Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-testid="admin-refresh"
              onClick={load}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              data-testid="admin-logout"
              onClick={onLogout}
              variant="ghost"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Total</p>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground" data-testid="stat-total">{data.stats?.total || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Paid</p>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-semibold text-foreground" data-testid="stat-paid">{data.stats?.paid || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Pending</p>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-semibold text-foreground" data-testid="stat-pending">{data.stats?.pending || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Revenue</p>
              <DollarSign className="w-4 h-4 text-[#2A7AFE]" />
            </div>
            <p className="text-3xl font-semibold text-[#2A7AFE]" data-testid="stat-revenue">${(data.stats?.revenue_usd || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="admin-search"
              placeholder="Search by name, email, company, project type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'failed'].map((f) => (
              <button
                key={f}
                data-testid={`admin-filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-[#2A7AFE] text-white'
                    : 'bg-background border border-border text-foreground hover:bg-accent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody data-testid="admin-table-body">
                {loading && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading…
                  </td></tr>
                )}
                {!loading && filteredItems.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No submissions yet.
                  </td></tr>
                )}
                {!loading && filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                      <Calendar className="w-3 h-3 inline mr-1.5 opacity-60" />
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{item.full_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {item.email}
                      </p>
                      {item.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {item.company}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{item.project_type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.timeline}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xs" title={item.description}>
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-foreground font-medium">
                        {item.package_id === 'per_slide' ? 'Per Slide' : 'Monthly Retainer'}
                      </p>
                      {item.slide_count ? (
                        <p className="text-xs text-muted-foreground">{item.slide_count} slides</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <p className="font-semibold text-foreground">${item.amount?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground uppercase">{item.currency}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={item.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4">
          {filteredItems.length} of {data.items.length} entries shown
        </p>
      </main>
    </div>
  );
};

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [verifying, setVerifying] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }
    axios.get(`${API}/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setVerifying(false))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setVerifying(false);
      });
  }, [token]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2A7AFE] animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <LoginForm onSuccess={(t) => setToken(t)} />;
  }
  return <Dashboard token={token} onLogout={logout} />;
};
