import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, RefreshCw, DollarSign, CheckCircle2, Clock,
  Mail, Building2, Calendar, FileText, Search, Lock, Loader2,
  Layout, Plus, Trash2, Pencil, X, BookOpen, Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
  file_url: '',
  preview_url: '',
  tags: '',
  is_published: true,
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
            <Label className="text-sm text-foreground">Thumbnail URL *</Label>
            <Input
              data-testid="tpl-form-thumbnail"
              value={form.thumbnail_url}
              onChange={(e) => update('thumbnail_url', e.target.value)}
              placeholder="https://..."
              className="bg-background border-border mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-foreground">Download File URL</Label>
            <Input
              data-testid="tpl-form-file"
              value={form.file_url}
              onChange={(e) => update('file_url', e.target.value)}
              placeholder="Direct link to PPTX, PDF, or zip"
              className="bg-background border-border mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Host your file on Drive / Dropbox / S3 and paste the direct link here. Only revealed to authenticated (free) or paid users.
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
              <Label htmlFor="blog-cover">Cover image URL</Label>
              <Input
                id="blog-cover"
                data-testid="blog-cover-input"
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                placeholder="https://..."
              />
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

const Dashboard = ({ token, onLogout }) => {
  const [data, setData] = useState({ items: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('orders');

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
        </div>

        {tab === 'templates' ? (
          <TemplatesManager token={token} />
        ) : tab === 'blog' ? (
          <BlogManager token={token} />
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
