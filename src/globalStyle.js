import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { up } from "./styles/media";

export const GlobalStyle = createGlobalStyle`
    ${reset}
    * {
          padding : 0;
          margin : 0;
          outline : none;
          font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
        }
    
    :root {
        --safe-top: env(safe-area-inset-top);
        --safe-bottom: env(safe-area-inset-bottom);
        --Text-main: #F8F9FE;
        --Text-sub: #767676;
        --background-elevate: #222222;
        --background-hover: #202020ff;
        --background-btn: #2b2b2b;
        --background: #1b1b1b;
        --background-lower: #303030;
        --point-red: #FF6E6E;
        --point-blue: #6E76FF;

        --active-transform: scale(0.95);
    }

    #root {
        width: 100%;
        height: 100%;
    }

    .app {
        width: 100%;
        height: 100%;
        background-color: ${({ theme }) => theme.bgColor}
     }

    .app > main {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }

    #bottom-nav {
        background-color: ${({ theme }) => theme.bgColor}
    }

    
    
    ${up("xl")`
        *::-webkit-scrollbar {
            display: none;
        }
    `}
    
`;
