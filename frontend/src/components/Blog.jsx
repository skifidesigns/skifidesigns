import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Calendar, Tag, ArrowUpRight } from 'lucide-react';
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
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return ''; }
};

const PostCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    data-testid={`blog-card-${post.slug}`}
    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-[#2A7AFE]/50 hover:shadow-xl hover:shadow-[#2A7AFE]/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
  >
    {post.cover_image_url && (
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={assetUrl(post.cover_image_url)}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    )}
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(post.created_at)}
        </span>
        <span>·</span>
        <span>{post.author}</span>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-[#2A7AFE] transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
        {post.excerpt}
      </p>
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-wider text-[#2A7AFE] font-semibold bg-[#2A7AFE]/10 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2A7AFE] mt-auto">
        Read article
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </span>
    </div>
  </Link>
);

export const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog - Pitch Deck & Presentation Design Insights | SkiFi Designs';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Expert guides on pitch deck design, investor presentations, sales decks and PowerPoint design from the SkiFi Designs team.');

    axios.get(`${API}/blog`)
      .then((res) => setPosts(res.data.items || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <section className="pt-32 pb-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-4" data-testid="blog-eyebrow">
              SkiFi Designs Blog
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
              Insights for{' '}
              <span className="text-gradient-animated">winning presentations</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert guides on pitch deck design, investor presentations, sales decks and PowerPoint design.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#2A7AFE]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 bg-card border border-border rounded-2xl">
              <Tag className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No blog posts yet - check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blog-grid">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Blog;
