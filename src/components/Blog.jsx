import styled from 'styled-components';

const blogPosts = [
  {
    title: 'Building AI Agents',
    excerpt: 'A deep dive into creating autonomous systems...',
    date: 'Coming Soon',
    tag: 'AI',
  },
  {
    title: 'Understanding LLMs',
    excerpt: 'Exploring the foundations of large language models...',
    date: 'Coming Soon',
    tag: 'Research',
  },
  {
    title: 'Prompt Engineering',
    excerpt: 'Best practices for effective prompt design...',
    date: 'Coming Soon',
    tag: 'Tutorial',
  },
];

export default function Blog() {
  return (
    <StyledWrapper>
      <section className="blog-section">
        <h2 className="section-title">Latest Writing</h2>
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <article key={index} className="blog-card">
              <span className="blog-tag">{post.tag}</span>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className="blog-footer">
                <span className="blog-date">{post.date}</span>
                <span className="blog-arrow">→</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .blog-section {
    padding: 6rem 0;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .blog-card {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 20px;
    padding: 1.75rem;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);

      &::before {
        transform: scaleX(1);
      }

      .blog-arrow {
        transform: translateX(5px);
      }
    }
  }

  .blog-tag {
    display: inline-block;
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    color: #64748b;
    font-size: 0.7rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 500;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .blog-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .blog-excerpt {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  .blog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .blog-date {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .blog-arrow {
    font-size: 1.2rem;
    color: #3b82f6;
    transition: transform 0.3s ease;
  }

  @media (prefers-color-scheme: dark) {
    .section-title {
      color: #f1f5f9;
    }

    .blog-card {
      background: linear-gradient(145deg, #1e293b, #0f172a);
      border-color: rgba(255, 255, 255, 0.05);

      &:hover {
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
      }
    }

    .blog-tag {
      background: linear-gradient(135deg, #334155, #1e293b);
      color: #94a3b8;
    }

    .blog-title {
      color: #f1f5f9;
    }

    .blog-excerpt {
      color: #94a3b8;
    }

    .blog-footer {
      border-top-color: rgba(255, 255, 255, 0.05);
    }

    .blog-date {
      color: #64748b;
    }
  }
`;
