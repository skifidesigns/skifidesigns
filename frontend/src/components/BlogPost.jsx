import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Calendar, ArrowLeft, Tag } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND = process.env.REACT_APP_BACKEND_URL;
const assetUrl = (p) => (!p ? '' : (/^https?:/i.test(p) ? p : `${BACKEND}${p.startsWith('/') ? '' : '/'}${p}`));

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
};

export const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    axios.get(`${API}/blog/${slug}`)
      .then((res) => {
        setPost(res.data);
        document.title = `${res.data.title} | SkiFi Designs Blog`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', res.data.excerpt.slice(0, 155));

        // Inject BlogPosting JSON-LD for SEO
        const existing = document.getElementById('blog-post-jsonld');
        if (existing) existing.remove();
        const script = document.createElement('script');
        script.id = 'blog-post-jsonld';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: res.data.title,
          description: res.data.excerpt,
          image: assetUrl(res.data.cover_image_url) || 'https://skifidesigns.com/og-image.jpg',
          datePublished: res.data.created_at,
          dateModified: res.data.updated_at || res.data.created_at,
          author: { '@type': 'Organization', name: res.data.author || 'SkiFi Designs' },
          publisher: {
            '@type': 'Organization',
            name: 'SkiFi Designs',
            logo: { '@type': 'ImageObject', url: 'https://skifidesigns.com/skifi-logo.svg' },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `https://skifidesigns.com/blog/${res.data.slug}` },
        });
        document.head.appendChild(script);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));

    return () => {
      const s = document.getElementById('blog-post-jsonld');
      if (s) s.remove();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="flex justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-[#2A7AFE]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-40 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-8">This article may have been removed or the link is incorrect.</p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-medium rounded-lg transition"
            data-testid="back-to-blog-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <article className="pt-32 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2A7AFE] transition mb-8"
            data-testid="back-to-blog-link"
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
          </Link>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-wider text-[#2A7AFE] font-semibold bg-[#2A7AFE]/10 px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6" data-testid="blog-post-title">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.created_at)}
            </span>
            <span>·</span>
            <span>{post.author}</span>
          </div>

          {post.cover_image_url && (
            <img
              src={assetUrl(post.cover_image_url)}
              alt={post.title}
              className="w-full aspect-[16/9] object-cover rounded-2xl mb-12 border border-border"
            />
          )}

          <div className="prose-skifi text-foreground" data-testid="blog-post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-16 pt-10 border-t border-border">
            <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Ready to win business?</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Get a presentation that closes deals.
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Book a free 30-minute call with our design team - we'll review your current deck and share quick wins.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-medium rounded-lg transition"
                data-testid="blog-post-cta"
              >
                Book a Free Call
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default BlogPost;
