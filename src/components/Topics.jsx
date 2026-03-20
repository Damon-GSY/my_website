import styled from 'styled-components';
import TopicCard from './TopicCard';

const topics = [
  {
    icon: '🤖',
    title: 'AI Agents',
    description: 'Building intelligent autonomous systems that can reason, plan, and execute complex tasks.',
    tags: ['LLM', 'RAG', 'Tool Use'],
  },
  {
    icon: '🧠',
    title: 'Foundation Models',
    description: 'Working with LLMs and large-scale models to create transformative applications.',
    tags: ['Claude', 'GPT', 'Fine-tuning'],
  },
];

export default function Topics() {
  return (
    <StyledWrapper>
      <section className="topics-section">
        <h2 className="section-title">What I Focus On</h2>
        <div className="topics-grid">
          {topics.map((topic) => (
            <TopicCard key={topic.title} {...topic} />
          ))}
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .topics-section {
    padding: 4rem 0;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .section-title {
      color: #f1f5f9;
    }
  }
`;
