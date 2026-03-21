import styled from 'styled-components';

export default function Layout({ children }) {
  return (
    <StyledWrapper>
      <div className="site-shell">
        {children}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .site-shell {
    min-height: 100vh;
    background: radial-gradient(circle at 15% -20%, #f2f9f7 0%, transparent 40%), var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
`;
