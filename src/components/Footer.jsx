import styled from 'styled-components';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <StyledWrapper>
      <footer className="footer">
        <p>&copy; {year} All rights reserved.</p>
      </footer>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .footer {
    padding: 3rem 0;
    text-align: center;
    color: #94a3b8;
    font-size: 0.875rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  p {
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .footer {
      border-top-color: rgba(255, 255, 255, 0.05);
    }
  }
`;
