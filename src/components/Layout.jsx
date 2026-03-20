import styled from 'styled-components';

export default function Layout({ children }) {
  return (
    <StyledWrapper>
      <div className="layout">
        {children}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .layout {
    min-height: 100vh;
    background: #fff;
    color: #1a1a1a;
    font-family: 'Cartograph CF', "Poppins", system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }

  @media (prefers-color-scheme: dark) {
    .layout {
      background: #0f172a;
      color: #f1f5f9;
    }
  }
`;
