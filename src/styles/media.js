import { css } from "styled-components";

export const up =
  (key) =>
  (strings, ...interpolations) =>
    css`
      @media (min-width: ${({ theme }) => theme.bp[key]}px) {
        ${css(strings, ...interpolations)};
      }
    `;

export const down =
  (key) =>
  (strings, ...interpolations) =>
    css`
      @media (max-width: ${({ theme }) => theme.bp[key] - 0.02}px) {
        ${css(strings, ...interpolations)};
      }
    `;
