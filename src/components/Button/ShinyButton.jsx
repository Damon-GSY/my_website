import React from 'react';
import styled from 'styled-components';

const ShinyButton = ({ text = 'Get early access' }) => {
  return (
    <StyledWrapper>
      <a href="#" className="btn-shine">{text}</a>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  display: inline-block;

  .btn-shine {
    position: relative;
    padding: 12px 48px;
    color: #fff;
    background: linear-gradient(to right, #9f9f9f 0, #fff 10%, #868686 20%);
    background-position: 0;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 3s infinite linear;
    animation-fill-mode: forwards;
    -webkit-text-size-adjust: none;
    font-weight: 600;
    font-size: 16px;
    text-decoration: none;
    white-space: nowrap;
    font-family: "Poppins", sans-serif;
  }

  @keyframes shine {
    0% {
      background-position: 0;
    }
    60% {
      background-position: 180px;
    }
    100% {
      background-position: 180px;
    }
  }
`;

export default ShinyButton;
