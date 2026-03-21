import styled from 'styled-components';
import { BlurFade } from './ui/blur-fade';

const posts = [
  {
    category: 'Productivity',
    title: 'The 3-layer weekly review I use to stay focused',
    excerpt: 'A lightweight planning rhythm that keeps your priorities clear even when your week gets messy.',
    meta: 'March 18, 2026 · 6 min read',
  },
  {
    category: 'AI Workflow',
    title: 'How I use AI to turn rough ideas into publishable drafts',
    excerpt: 'A practical end-to-end writing workflow that balances speed with quality and personal voice.',
    meta: 'March 6, 2026 · 8 min read',
  },
  {
    category: 'Creator Business',
    title: 'From notes to assets: building a tiny content product system',
    excerpt: 'How to repurpose one core idea into newsletter posts, short videos, and a paid digital asset.',
    meta: 'February 26, 2026 · 7 min read',
  },
];

export default function Blog() {
  return (
    <StyledWrapper>
      <section className="section" id="writing">
        <div className="container">
          <BlurFade delay={0.1} inView>
            <div className="heading-row">
              <div>
                <p className="kicker">Latest Writing</p>
                <h2>Thoughtful ideas, practical actions.</h2>
              </div>
              <a href="#" className="view-all">View all posts</a>
            </div>
          </BlurFade>

          <div className="post-grid">
            {posts.map((post, index) => (
              <BlurFade key={post.title} delay={0.2 + index * 0.1} inView>
                <article className="post-card">
                  <p className="category">{post.category}</p>
                  <h3>{post.title}</h3>
                  <p className="excerpt">{post.excerpt}</p>
                  <p className="meta">{post.meta}</p>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .heading-row {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
    margin-bottom: 1.6rem;
  }

  .kicker {
    margin: 0;
    color: var(--muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h2 {
    margin: 0.65rem 0 0;
    font-size: clamp(1.65rem, 2.8vw, 2.3rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .view-all {
    color: var(--primary-strong);
    font-weight: 600;
    font-size: 0.92rem;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  .view-all:hover {
    color: var(--primary);
  }

  .post-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .post-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 1.3rem;
    box-shadow: var(--shadow-soft);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }

  .post-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-soft), 0 12px 24px rgba(0, 0, 0, 0.08);
  }

  .category {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }

  h3 {
    margin: 0.7rem 0 0;
    font-size: 1.16rem;
    line-height: 1.35;
    transition: color 0.2s ease;
  }

  .post-card:hover h3 {
    color: var(--primary-strong);
  }

  .excerpt {
    margin: 0.8rem 0 0;
    color: var(--muted);
    line-height: 1.65;
    font-size: 0.94rem;
  }

  .meta {
    margin: 0.9rem 0 0;
    color: var(--muted-strong);
    font-size: 0.84rem;
  }

  @media (max-width: 980px) {
    .post-grid {
      grid-template-columns: 1fr;
    }

    .heading-row {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 1.2rem;
    }
  }
`;
