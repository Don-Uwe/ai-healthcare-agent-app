import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

export const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

export const LoadingRows = styled.div`
  display: grid;

  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(to left, #f5f6fc 25%, #e8ecfb 50%, #f5f6fc 75%);
    background-size: 400%;
    border-radius: 12px;
    height: 2.4em;
    will-change: background-position;
  }
`

export const LoadingOpacityContainer = styled.div<{ $loading: boolean }>`
  filter: ${({ $loading }) => ($loading ? 'grayscale(1)' : 'none')};
  opacity: ${({ $loading }) => ($loading ? '0.4' : '1')};
  transition: opacity 0.2s ease-in-out;
`
