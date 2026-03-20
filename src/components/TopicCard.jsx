import styled from 'styled-components';

const reactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🎉', label: 'Celebrate' },
];

function ReactionButton() {
  return (
    <StyledReactionWrapper>
      <div className="reaction-container">
        {reactions.map((reaction, index) => (
          <button
            key={index}
            className="reaction-btn"
            data-label={reaction.label}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </StyledReactionWrapper>
  );
}

export default function TopicCard({ title, description, icon, tags }) {
  return (
    <StyledWrapper>
      <div className="topic-card">
        <div className="card-header">
          <span className="topic-icon">{icon}</span>
          <div className="topic-tags">
            {tags?.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        <h3 className="topic-title">{title}</h3>
        <p className="topic-desc">{description}</p>
        <div className="card-footer">
          <div className="reaction-wrapper">
            <span className="like-hint">Like this?</span>
            <ReactionButton />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledReactionWrapper = styled.div`
  .reaction-container {
    display: flex;
    gap: 0.25rem;
    background: #f1f5f9;
    padding: 0.5rem;
    border-radius: 50px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .reaction-btn {
    position: relative;
    background: #fff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: translateY(-8px) scale(1.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &::before {
      content: attr(data-label);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      color: #fff;
      font-size: 0.65rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      margin-bottom: 8px;
      font-family: system-ui, sans-serif;
    }

    &:hover::before {
      opacity: 1;
      visibility: visible;
    }
  }

  @media (prefers-color-scheme: dark) {
    .reaction-container {
      background: #1e293b;
    }

    .reaction-btn {
      background: #334155;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      &::before {
        background: #f1f5f9;
        color: #1e293b;
      }
    }
  }
`;

const StyledWrapper = styled.div`
  .topic-card {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 24px;
    padding: 2rem;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.2);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .topic-icon {
    font-size: 2.5rem;
    display: block;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .topic-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .tag {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-weight: 500;
  }

  .topic-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .topic-desc {
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
    flex-grow: 1;
  }

  .card-footer {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .reaction-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .like-hint {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  @media (prefers-color-scheme: dark) {
    .topic-card {
      background: linear-gradient(145deg, #1e293b, #0f172a);
      border-color: rgba(255, 255, 255, 0.05);

      &:hover {
        box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
        border-color: rgba(59, 130, 246, 0.3);
      }
    }

    .topic-title {
      color: #f1f5f9;
    }

    .topic-desc {
      color: #94a3b8;
    }

    .card-footer {
      border-top-color: rgba(255, 255, 255, 0.05);
    }

    .like-hint {
      color: #64748b;
    }
  }
`;
