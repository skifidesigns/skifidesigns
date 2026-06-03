import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, RefreshCw, DollarSign, CheckCircle2, Clock,
  Mail, Building2, Calendar, FileText, Search, Lock, Loader2,
  Layout, Plus, Trash2, Pencil, X, BookOpen, Eye, Paperclip, Download,
  Upload, Send, Briefcase, Star, Receipt, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar as CalendarUI } from './ui/calendar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'skifi-admin-token';

const formatDate = (iso) => {
  if (!iso) return '-';
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

const TEMPLATE_CATEGORIES = [
  'Pitch Deck', 'Sales Deck', 'Corporate Presentation', 'Investor Deck',
  'Webinar / Keynote', 'Infographic', 'Brand Presentation',
];

const emptyTemplateForm = {
  title: '',
  description: '',
  category: 'Pitch Deck',
  type: 'free',
  price: 0,
  thumbnail_url: '',
  thumbnail_file_id: '',
  file_url: '',
  template_file_id: '',
  preview_url: '',
  tags: '',
  is_published: true,
};

// Build an absolute URL from a /api/... path (or pass-through external URLs).
const absoluteUrl = (path) => {
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  return `${process.env.REACT_APP_BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const AdminImageUploader = ({ value, onChange, token, testId }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast.error('Image must be ≤ 50 MB');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await axios.post(`${API}/admin/upload`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url, data.file_id);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  return (
    <div className="flex items-start gap-3">
      <div className="flex-grow">
        <Input
          data-testid={testId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value, '')}
          placeholder="Paste an image URL or upload below"
          className="bg-background border-border"
        />
        {value && (
          <img
            src={absoluteUrl(value)}
            alt="Preview"
            className="mt-2 h-20 w-32 object-cover rounded-md border border-border"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="shrink-0 mt-0"
        data-testid={`${testId}-upload`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
        {uploading ? 'Uploading' : 'Upload'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

const AdminFileUploader = ({ value, fileId, onChange, token, testId, accept }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const inputRef = useRef(null);
  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast.error('File must be ≤ 50 MB');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await axios.post(`${API}/admin/upload`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setUploadedName(data.filename);
      onChange('', data.file_id);
      toast.success(`${data.filename} uploaded`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          data-testid={testId}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading…' : (fileId ? 'Replace file' : 'Upload file')}
        </Button>
        {fileId && (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[#2A7AFE]" />
            {uploadedName || 'File ready'}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div>
        <Label className="text-xs text-muted-foreground">…or paste an external URL</Label>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value, '')}
          placeholder="Drive / Dropbox / S3 direct link"
          className="bg-background border-border mt-1 text-xs"
        />
      </div>
    </div>
  );
};

const TemplateFormModal = ({ open, onClose, onSave, initial, token }) => {
  const [form, setForm] = useState(emptyTemplateForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        ...emptyTemplateForm,
        ...initial,
        tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
      });
    } else {
      setForm(emptyTemplateForm);
    }
  }, [initial, open]);

  if (!open) return null;
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.thumbnail_url) {
      toast.error('Title and thumbnail URL are required');
      return;
    }
    if (form.type === 'paid' && (!form.price || form.price <= 0)) {
      toast.error('Paid templates need a price > 0');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      if (initial?.id) {
        await axios.patch(`${API}/admin/templates/${initial.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Template updated');
      } else {
        await axios.post(`${API}/admin/templates`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Template created');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 my-auto"
        data-testid="template-form-modal"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            {initial?.id ? 'Edit template' : 'Add template'}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label className="text-sm text-foreground">Title *</Label>
            <Input
              data-testid="tpl-form-title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Modern Pitch Deck"
              className="bg-background border-border mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-foreground">Description</Label>
            <Textarea
              data-testid="tpl-form-description"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Short description shown on the card"
              className="bg-background border-border mt-1 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-foreground">Category</Label>
              <select
                data-testid="tpl-form-category"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm"
              >
                {TEMPLATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-sm text-foreground">Type</Label>
              <select
                data-testid="tpl-form-type"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          {form.type === 'paid' && (
            <div>
              <Label className="text-sm text-foreground">Price (USD)</Label>
              <Input
                data-testid="tpl-form-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="bg-background border-border mt-1"
              />
            </div>
          )}
          <div>
            <Label className="text-sm text-foreground">Thumbnail image *</Label>
            <div className="mt-1">
              <AdminImageUploader
                value={form.thumbnail_url}
                token={token}
                testId="tpl-form-thumbnail"
                onChange={(url, fileId) => {
                  if (fileId) {
                    update('thumbnail_file_id', fileId);
                    update('thumbnail_url', `/api/files/${fileId}`);
                  } else {
                    update('thumbnail_url', url);
                    update('thumbnail_file_id', '');
                  }
                }}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm text-foreground">Template file</Label>
            <div className="mt-1">
              <AdminFileUploader
                value={form.file_url}
                fileId={form.template_file_id}
                token={token}
                testId="tpl-form-file"
                accept=".pdf,.pptx,.ppt,.key,.zip,.rar,.fig,.sketch,.ai,.psd"
                onChange={(url, fileId) => {
                  update('template_file_id', fileId || '');
                  update('file_url', url || '');
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Recommended: upload the file directly here - clients download in one click after sign-in (free) or payment (paid). External links also work but are less secure.
            </p>
          </div>
          <div>
            <Label className="text-sm text-foreground">Preview URL (optional)</Label>
            <Input
              data-testid="tpl-form-preview"
              value={form.preview_url}
              onChange={(e) => update('preview_url', e.target.value)}
              placeholder="Behance link, Figma, etc."
              className="bg-background border-border mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-foreground">Tags (comma-separated)</Label>
            <Input
              data-testid="tpl-form-tags"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="startup, investor, modern"
              className="bg-background border-border mt-1"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => update('is_published', e.target.checked)}
              className="w-4 h-4"
            />
            Published (visible on /resources)
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            type="submit"
            data-testid="tpl-form-save"
            disabled={saving}
            className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : initial?.id ? 'Save changes' : 'Create template'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const TemplatesManager = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.items || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/admin/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground">Manage free and paid resources for the /resources page</p>
        </div>
        <Button
          data-testid="add-template-btn"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add template
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin inline-block text-[#2A7AFE]" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Layout className="w-10 h-10 mx-auto mb-3 opacity-50" />
            No templates yet. Click "Add template" to create your first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={t.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted" />
                        <div>
                          <p className="font-semibold text-foreground">{t.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{t.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.type === 'paid' ? 'bg-[#2A7AFE]/10 text-[#2A7AFE]' : 'bg-green-500/10 text-green-600'
                      }`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {t.type === 'paid' ? `$${t.price?.toFixed(2)}` : 'Free'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${t.is_published ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {t.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          data-testid={`edit-tpl-${t.id}`}
                          onClick={() => { setEditing(t); setModalOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          data-testid={`delete-tpl-${t.id}`}
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TemplateFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={load}
        initial={editing}
        token={token}
      />
    </div>
  );
};

// =================== BLOG MANAGER ===================
const BlogFormModal = ({ open, onClose, onSave, initial, token }) => {
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', cover_image_url: '',
    author: 'SkiFi Designs', tags: '', is_published: true,
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        excerpt: initial.excerpt || '',
        content: initial.content || '',
        cover_image_url: initial.cover_image_url || '',
        author: initial.author || 'SkiFi Designs',
        tags: (initial.tags || []).join(', '),
        is_published: initial.is_published !== false,
      });
    } else {
      setForm({
        title: '', excerpt: '', content: '', cover_image_url: '',
        author: 'SkiFi Designs', tags: '', is_published: true,
      });
    }
    setShowPreview(false);
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 2) return toast.error('Title is too short');
    if (form.excerpt.trim().length < 2) return toast.error('Excerpt is required');
    if (form.content.trim().length < 10) return toast.error('Content must be at least 10 characters');

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        cover_image_url: form.cover_image_url.trim() || null,
        author: form.author.trim() || 'SkiFi Designs',
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_published: form.is_published,
      };
      if (initial) {
        await axios.patch(`${API}/admin/blog/${initial.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Post updated');
      } else {
        await axios.post(`${API}/admin/blog`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Post created');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-2xl">
          <h3 className="text-lg font-semibold text-foreground">
            {initial ? 'Edit blog post' : 'New blog post'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent" data-testid="close-blog-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <Label htmlFor="blog-title">Title *</Label>
            <Input
              id="blog-title"
              data-testid="blog-title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="How to design an investor pitch deck that wins funding"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">URL slug auto-generated from title.</p>
          </div>

          <div>
            <Label htmlFor="blog-excerpt">Excerpt * (shows on cards & meta description)</Label>
            <Textarea
              id="blog-excerpt"
              data-testid="blog-excerpt-input"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A practical guide to building a pitch deck that actually closes investors."
              maxLength={400}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{form.excerpt.length}/400 chars</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blog-cover">Cover image</Label>
              <div className="mt-1">
                <AdminImageUploader
                  value={form.cover_image_url}
                  token={token}
                  testId="blog-cover-input"
                  onChange={(url, fileId) => {
                    if (fileId) {
                      setForm({ ...form, cover_image_url: `/api/files/${fileId}` });
                    } else {
                      setForm({ ...form, cover_image_url: url });
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="blog-author">Author</Label>
              <Input
                id="blog-author"
                data-testid="blog-author-input"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="SkiFi Designs"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
            <Input
              id="blog-tags"
              data-testid="blog-tags-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="pitch deck, investor, fundraising"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="blog-content">Content (Markdown) *</Label>
              <button
                type="button"
                data-testid="blog-preview-toggle"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-medium text-[#2A7AFE] inline-flex items-center gap-1.5 hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {showPreview ? (
              <div className="prose-skifi border border-border bg-background rounded-lg p-5 min-h-[300px] max-h-[500px] overflow-y-auto" data-testid="blog-preview-pane">
                {form.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview yet.</p>
                )}
              </div>
            ) : (
              <Textarea
                id="blog-content"
                data-testid="blog-content-input"
                rows={16}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder={`# Heading 1\n## Heading 2\n\nParagraph text. **Bold**, *italic*, [link](https://example.com).\n\n- Bullet 1\n- Bullet 2\n\n1. Numbered list\n2. Item two\n\n> Quote\n\n\`\`\`\ncode block\n\`\`\``}
                className="font-mono text-sm"
                required
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Supports Markdown: headings, **bold**, *italic*, lists, links, code, tables, quotes.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              data-testid="blog-published-toggle"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 accent-[#2A7AFE]"
            />
            <span className="text-sm text-foreground">Published (visible on /blog)</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              data-testid="blog-save-btn"
              disabled={saving}
              className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (initial ? 'Update post' : 'Publish post')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BlogManager = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/blog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.items || []);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/admin/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Post deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Blog</h2>
          <p className="text-sm text-muted-foreground">Write SEO-optimised articles for /blog</p>
        </div>
        <Button
          data-testid="add-blog-btn"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New post
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin inline-block text-[#2A7AFE]" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
            No posts yet. Click "New post" to write your first article.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Post</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tags</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.cover_image_url ? (
                          <img src={p.cover_image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="max-w-md">
                          <p className="font-semibold text-foreground line-clamp-1">{p.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(p.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${p.is_published ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          data-testid={`edit-blog-${p.id}`}
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          data-testid={`delete-blog-${p.id}`}
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BlogFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={load}
        initial={editing}
        token={token}
      />
    </div>
  );
};

// =================== ORDER FILES (admin) ===================
const formatBytes = (b) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const OrderFiles = ({ sessionId, fileCount, token }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && files.length === 0) {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/admin/orders/${sessionId}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(data.items || []);
      } catch {
        toast.error('Could not load files');
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadFile = async (file_id, filename) => {
    try {
      const resp = await axios.get(`${API}/admin/files/${file_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Could not download ${filename}`);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggleOpen}
        data-testid={`order-files-toggle-${sessionId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2A7AFE] hover:underline"
      >
        <Paperclip className="w-3 h-3" />
        {open ? 'Hide' : 'Show'} {fileCount} attached file{fileCount !== 1 ? 's' : ''}
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5" data-testid={`order-files-list-${sessionId}`}>
          {loading && (
            <li className="text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Loading…
            </li>
          )}
          {!loading && files.length === 0 && (
            <li className="text-xs text-muted-foreground">No files found.</li>
          )}
          {!loading && files.map((f) => (
            <li key={f.file_id} className="flex items-center gap-2 text-xs bg-background border border-border rounded-md px-2 py-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2A7AFE] shrink-0" />
              <span className="flex-grow truncate text-foreground" title={f.filename}>{f.filename}</span>
              <span className="text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
              <button
                onClick={() => downloadFile(f.file_id, f.filename)}
                data-testid={`download-file-${f.file_id}`}
                aria-label="Download"
                className="p-1 rounded hover:bg-accent text-[#2A7AFE] shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DeliveryModal = ({ open, order, token, onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFiles([]);
      setMessage('');
    }
  }, [open, order?.session_id]);

  if (!open || !order) return null;

  const handleFiles = async (fileList) => {
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
        const { data } = await axios.post(`${API}/admin/upload`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setFiles((prev) => [...prev, data]);
        toast.success(`${data.filename} uploaded`);
      } catch (err) {
        toast.error(err?.response?.data?.detail || `Upload of ${file.name} failed`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (file_id) => setFiles((prev) => prev.filter((f) => f.file_id !== file_id));

  const handleDeliver = async () => {
    if (files.length === 0) return toast.error('Upload at least one file');
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/admin/orders/${order.session_id}/deliveries`,
        { message: message.trim() || null, file_ids: files.map((f) => f.file_id) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Delivery sent to ${order.email}`);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not send delivery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl my-8 shadow-2xl" data-testid="delivery-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-2xl">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Deliver project</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{order.full_name} · {order.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent" data-testid="close-delivery-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <Label htmlFor="delivery-message">Message to client (optional)</Label>
            <Textarea
              id="delivery-message"
              rows={4}
              data-testid="delivery-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! Your deck is ready. We've included a PDF preview and the source PPTX. Let us know if you'd like any tweaks."
              maxLength={2000}
              className="mt-1 bg-background border-border"
            />
          </div>

          <div>
            <Label>Final files to deliver *</Label>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
              className="mt-1 border-2 border-dashed border-border hover:border-[#2A7AFE]/60 hover:bg-[#2A7AFE]/5 rounded-xl px-4 py-6 text-center cursor-pointer transition-colors"
              data-testid="delivery-dropzone"
            >
              <Upload className="w-7 h-7 mx-auto text-[#2A7AFE] mb-2" />
              <p className="text-sm text-foreground font-medium">
                {uploading ? 'Uploading…' : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PPTX, ZIP, images · up to 50 MB each</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {files.length > 0 && (
              <ul className="mt-3 space-y-2" data-testid="delivery-file-list">
                {files.map((f) => (
                  <li key={f.file_id} className="flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-[#2A7AFE]" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{f.filename}</p>
                      <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => removeFile(f.file_id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 sticky bottom-0 bg-card rounded-b-2xl">
          <p className="text-xs text-muted-foreground">
            Client will get an email and see this in their dashboard.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleDeliver}
              disabled={submitting || files.length === 0}
              className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
              data-testid="delivery-send-btn"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ===================== Case Studies Manager =====================
const CaseStudyFormModal = ({ open, onClose, onSave, initial, token }) => {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    title: '', client_name: '', industry: '', summary: '',
    cover_image_url: '', challenge: '', approach: '',
    outcome: '', gallery_urls: '', tags: '',
    is_featured: false, is_published: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title || '',
        client_name: initial.client_name || '',
        industry: initial.industry || '',
        summary: initial.summary || '',
        cover_image_url: initial.cover_image_url || '',
        challenge: initial.challenge || '',
        approach: initial.approach || '',
        outcome: (initial.outcome || []).join('\n'),
        gallery_urls: (initial.gallery_urls || []).join('\n'),
        tags: (initial.tags || []).join(', '),
        is_featured: !!initial.is_featured,
        is_published: initial.is_published !== false,
      });
    } else {
      setForm({
        title: '', client_name: '', industry: '', summary: '',
        cover_image_url: '', challenge: '', approach: '',
        outcome: '', gallery_urls: '', tags: '',
        is_featured: false, is_published: true,
      });
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        client_name: form.client_name.trim(),
        industry: form.industry.trim(),
        summary: form.summary.trim(),
        cover_image_url: form.cover_image_url.trim() || null,
        challenge: form.challenge.trim(),
        approach: form.approach.trim(),
        outcome: form.outcome.split('\n').map((s) => s.trim()).filter(Boolean),
        gallery_urls: form.gallery_urls.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        is_featured: form.is_featured,
        is_published: form.is_published,
      };
      if (isEdit) {
        await axios.patch(`${API}/admin/case-studies/${initial.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Case study updated');
      } else {
        await axios.post(`${API}/admin/case-studies`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Case study created');
      }
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <form
        onSubmit={submit}
        className="bg-card border border-border rounded-2xl w-full max-w-3xl my-8 p-6 shadow-2xl"
        data-testid="case-study-form"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{isEdit ? 'Edit Case Study' : 'New Case Study'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
          </div>
          <div>
            <Label>Client name *</Label>
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required maxLength={120} />
          </div>
          <div>
            <Label>Industry *</Label>
            <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required maxLength={80} placeholder="e.g. SaaS, FMCG, Aviation" />
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="pitch-deck, saas, infographics" />
          </div>
        </div>

        <div className="mt-3">
          <Label>Summary *</Label>
          <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required rows={2} maxLength={400} />
        </div>

        <div className="mt-3">
          <Label>Cover image URL</Label>
          <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." />
        </div>

        <div className="mt-3">
          <Label>Challenge *</Label>
          <Textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} required rows={3} />
        </div>

        <div className="mt-3">
          <Label>Approach *</Label>
          <Textarea value={form.approach} onChange={(e) => setForm({ ...form, approach: e.target.value })} required rows={3} />
        </div>

        <div className="mt-3">
          <Label>Outcome bullets (one per line)</Label>
          <Textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} rows={4} placeholder={'Raised $5M seed\nReduced pitch length by 40%\n...'} />
        </div>

        <div className="mt-3">
          <Label>Gallery image URLs (one per line)</Label>
          <Textarea value={form.gallery_urls} onChange={(e) => setForm({ ...form, gallery_urls: e.target.value })} rows={3} placeholder={'https://...\nhttps://...'} />
        </div>

        <div className="mt-4 flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
            Featured (shows on homepage)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};


const AiLabLeadsManager = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolFilter, setToolFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = toolFilter !== 'all' ? { tool: toolFilter } : {};
      const { data } = await axios.get(`${API}/admin/ai-lab/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setItems(data.items || []);
    } catch {
      toast.error('Failed to load AI Lab leads');
    } finally {
      setLoading(false);
    }
  }, [token, toolFilter]);

  useEffect(() => { load(); }, [load]);

  const downloadCsv = async () => {
    try {
      const res = await axios.get(`${API}/admin/ai-lab/leads.csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-lab-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Export failed');
    }
  };

  const filtered = items.filter((it) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (it.email || '').toLowerCase().includes(q) ||
      (it.name || '').toLowerCase().includes(q) ||
      (it.company || '').toLowerCase().includes(q) ||
      (it.deck_filename || '').toLowerCase().includes(q) ||
      (it.project_name || '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total: items.length,
    deck: items.filter((i) => i.tool === 'deck_review').length,
    template: items.filter((i) => i.tool === 'template_generator').length,
  };

  const toolLabel = (t) =>
    t === 'deck_review' ? 'Deck Review' : t === 'template_generator' ? 'Template Gen' : t;

  return (
    <div className="space-y-6" data-testid="ai-lab-leads-panel">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">AI Lab Leads</h2>
          <p className="text-sm text-muted-foreground">
            Warm signals from founders using SkiFi's free AI tools.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={load}
            variant="outline"
            size="sm"
            data-testid="ai-leads-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={downloadCsv}
            className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white"
            size="sm"
            data-testid="ai-leads-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Total leads</p>
          <p className="text-3xl font-semibold text-foreground" data-testid="ai-leads-stat-total">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Deck reviews</p>
          <p className="text-3xl font-semibold text-foreground" data-testid="ai-leads-stat-deck">{stats.deck}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Templates generated</p>
          <p className="text-3xl font-semibold text-foreground" data-testid="ai-leads-stat-template">{stats.template}</p>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { v: 'all', label: 'All' },
          { v: 'deck_review', label: 'Deck Reviews' },
          { v: 'template_generator', label: 'Template Generator' },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setToolFilter(opt.v)}
            data-testid={`ai-leads-filter-${opt.v}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              toolFilter === opt.v
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, company..."
            className="pl-9"
            data-testid="ai-leads-search"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2A7AFE] mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
          {items.length === 0 ? 'No leads yet. Promote /ai-lab to start capturing.' : 'No leads match your filter.'}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr
                    key={it.id}
                    className="border-t border-border hover:bg-muted/30"
                    data-testid={`ai-lead-row-${it.id}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(it.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          it.tool === 'deck_review'
                            ? 'bg-[#2A7AFE]/10 text-[#2A7AFE] border-[#2A7AFE]/20'
                            : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {toolLabel(it.tool)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{it.name || '-'}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${it.email}`}
                        className="text-[#2A7AFE] hover:underline inline-flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {it.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{it.company || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {it.tool === 'deck_review' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground">
                            {it.deck_filename || 'deck.pdf'}
                          </span>
                          {typeof it.overall_score === 'number' && (
                            <span className="text-xs">
                              Score: <span className="font-semibold text-foreground">{it.overall_score}</span>/100
                              {it.verdict && (
                                <span className="ml-2 italic">"{it.verdict}"</span>
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground">{it.project_name || '-'}</span>
                          <span className="text-xs inline-flex items-center gap-1.5">
                            {it.primary && (
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-border"
                                style={{ background: it.primary }}
                                title={it.primary}
                              />
                            )}
                            <span>{it.primary || ''}</span>
                            {it.co_branded && (
                              <span className="ml-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-semibold uppercase tracking-wider">
                                Co-branded
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


const CaseStudiesManager = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/case-studies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.items || []);
    } catch {
      toast.error('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this case study? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/admin/case-studies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Case study deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Case Studies</h2>
          <p className="text-sm text-muted-foreground">Manage portfolio case studies shown on /case-studies and the homepage.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white" data-testid="case-new">
          <Plus className="w-4 h-4 mr-2" /> New Case Study
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#2A7AFE] mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No case studies yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((cs) => (
            <div key={cs.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col" data-testid={`case-row-${cs.slug}`}>
              {cs.cover_image_url && (
                <div className="aspect-[16/9] bg-muted overflow-hidden">
                  <img src={cs.cover_image_url} alt={cs.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#2A7AFE] font-semibold">{cs.industry}</p>
                  <div className="flex items-center gap-1.5">
                    {cs.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {!cs.is_published && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Draft</span>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{cs.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-grow">{cs.summary}</p>
                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(cs); setModalOpen(true); }} data-testid={`case-edit-${cs.slug}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(cs.id)} className="text-red-500 hover:bg-red-500/10" data-testid={`case-delete-${cs.slug}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CaseStudyFormModal
        open={modalOpen}
        initial={editing}
        token={token}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={() => load()}
      />
    </div>
  );
};


const Dashboard = ({ token, onLogout }) => {
  const [data, setData] = useState({ items: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  // Date filter: a from→to range. null means "all time".
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('orders');
  const [deliveryFor, setDeliveryFor] = useState(null);

  // Fetches the receipt HTML via authenticated admin token and opens it in a
  // new tab as a blob URL (admin auth is Bearer, not cookie - so we cannot
  // just window.open the URL directly like the client dashboard does).
  const handleDownloadReceipt = useCallback(async (sessionId) => {
    try {
      const res = await axios.get(`${API}/admin/orders/${sessionId}/receipt`, {
        params: { format: 'pdf' },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      if (!w) toast.error('Pop-up blocked - allow pop-ups to view the receipt');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not load receipt');
    }
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      // "All" hides pending/unpaid clutter (abandoned checkouts) - show only
      // orders that actually matter for fulfilment. Other tabs are exact.
      if (filter === 'all') qs.append('payment_status', 'paid,failed');
      else qs.append('payment_status', filter);
      const toISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
      const fd = toISO(dateRange.from);
      const td = toISO(dateRange.to);
      if (fd) qs.append('from_date', fd);
      if (td) qs.append('to_date', td);
      const params = qs.toString() ? `?${qs}` : '';
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
  }, [token, filter, dateRange.from, dateRange.to, onLogout]);

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
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            data-testid="admin-tab-orders"
            onClick={() => setTab('orders')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'orders'
                ? 'border-[#2A7AFE] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Orders
          </button>
          <button
            data-testid="admin-tab-templates"
            onClick={() => setTab('templates')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'templates'
                ? 'border-[#2A7AFE] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layout className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            data-testid="admin-tab-blog"
            onClick={() => setTab('blog')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'blog'
                ? 'border-[#2A7AFE] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Blog
          </button>
          <button
            data-testid="admin-tab-case-studies"
            onClick={() => setTab('case-studies')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'case-studies'
                ? 'border-[#2A7AFE] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Case Studies
          </button>
          <button
            data-testid="admin-tab-ai-lab"
            onClick={() => setTab('ai-lab')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'ai-lab'
                ? 'border-[#2A7AFE] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            AI Lab Leads
          </button>
        </div>

        {tab === 'templates' ? (
          <TemplatesManager token={token} />
        ) : tab === 'blog' ? (
          <BlogManager token={token} />
        ) : tab === 'case-studies' ? (
          <CaseStudiesManager token={token} />
        ) : tab === 'ai-lab' ? (
          <AiLabLeadsManager token={token} />
        ) : (
        <div className="space-y-6">
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
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="admin-search"
              placeholder="Search by name, email, company, project type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex gap-2 flex-wrap">
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Period</span>
              {(() => {
                // Quick range presets - same UX as Stripe/Shopify dashboards
                const today = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; };
                const startOfWeek = () => {
                  const d = new Date(); d.setHours(0, 0, 0, 0);
                  // Monday-anchored week (matches calendar's default)
                  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
                  return d;
                };
                const startOfMonth = () => {
                  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(1); return d;
                };
                const isExactRange = (from, to) => {
                  if (!dateRange.from || !dateRange.to) return false;
                  const sameDay = (a, b) => a.toDateString() === b.toDateString();
                  return sameDay(dateRange.from, from) && sameDay(dateRange.to, to);
                };
                const isThisWeek = isExactRange(startOfWeek(), today());
                const isThisMonth = isExactRange(startOfMonth(), today());
                const presetBtn = (label, active, onClick, testId) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    data-testid={testId}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-background border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {label}
                  </button>
                );
                return (
                  <>
                    {presetBtn('This Week', isThisWeek,
                      () => setDateRange({ from: startOfWeek(), to: today() }), 'admin-period-week')}
                    {presetBtn('This Month', isThisMonth,
                      () => setDateRange({ from: startOfMonth(), to: today() }), 'admin-period-month')}
                  </>
                );
              })()}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    data-testid="admin-date-picker"
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      dateRange.from || dateRange.to
                        ? 'bg-foreground text-background'
                        : 'bg-background border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {dateRange.from && dateRange.to
                      ? `${new Date(dateRange.from).toLocaleDateString()} → ${new Date(dateRange.to).toLocaleDateString()}`
                      : dateRange.from
                        ? `From ${new Date(dateRange.from).toLocaleDateString()}`
                        : 'All time'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarUI
                    mode="range"
                    selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={(range) => setDateRange({ from: range?.from || null, to: range?.to || null })}
                    numberOfMonths={2}
                    initialFocus
                  />
                  <div className="flex justify-between gap-2 p-3 border-t border-border">
                    <button
                      onClick={() => { setDateRange({ from: null, to: null }); setCalendarOpen(false); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      data-testid="admin-date-clear"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setCalendarOpen(false)}
                      className="text-xs font-semibold text-[#2A7AFE]"
                      data-testid="admin-date-apply"
                    >
                      Apply
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody data-testid="admin-table-body">
                {loading && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading…
                  </td></tr>
                )}
                {!loading && filteredItems.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
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
                      {(item.file_ids?.length || 0) > 0 && (
                        <OrderFiles
                          sessionId={item.session_id}
                          fileCount={item.file_ids.length}
                          token={token}
                        />
                      )}
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
                    <td className="px-4 py-4 text-center">
                      {item.payment_status === 'paid' && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(item.session_id)}
                            data-testid={`admin-receipt-${item.session_id}`}
                            title="Download payment receipt"
                            aria-label="Download payment receipt"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-[#2A7AFE] hover:bg-[#2A7AFE]/10 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          {(() => {
                          // Status-aware action: nothing to do once delivered until client asks for revision.
                          const orderStatus = item.status || 'paid';
                          if (orderStatus === 'completed') {
                            return (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600/15 text-emerald-700"
                                data-testid={`status-completed-${item.session_id}`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </span>
                            );
                          }
                          if (orderStatus === 'delivered') {
                            return (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-green-500/10 text-green-600"
                                data-testid={`status-delivered-${item.session_id}`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Delivered
                              </span>
                            );
                          }
                          const isRevision = orderStatus === 'revision_requested';
                          return (
                            <button
                              onClick={() => setDeliveryFor(item)}
                              data-testid={`deliver-${item.session_id}`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                isRevision
                                  ? 'bg-amber-500/15 text-amber-600 hover:bg-amber-500 hover:text-white animate-pulse'
                                  : 'bg-[#2A7AFE]/10 text-[#2A7AFE] hover:bg-[#2A7AFE] hover:text-white'
                              }`}
                              title={isRevision ? 'Client requested a revision' : 'Send delivery'}
                            >
                              <Send className="w-3 h-3" />
                              {isRevision ? 'Re-deliver' : 'Deliver'}
                            </button>
                          );
                        })()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DeliveryModal
          open={!!deliveryFor}
          order={deliveryFor}
          token={token}
          onClose={() => setDeliveryFor(null)}
          onSuccess={() => { setDeliveryFor(null); load(); }}
        />

        <p className="text-xs text-muted-foreground text-center pt-4">
          {filteredItems.length} of {data.items.length} entries shown
        </p>
        </div>
        )}
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
