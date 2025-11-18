import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { router } from "./components/router";
import { ThemeProviderMine } from "./themeProvider";
import { GlobalStyle } from "./globalStyle";
import { PageProvider } from "./pageProvider";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
import { ModalProvider } from "./components/modal";
import { AliveScope } from "react-activation";

export default function App() {
  return (
    <ThemeProviderMine>
      <ModalProvider>
        <ThemeProvider theme={theme}>
          <PageProvider>
            <GlobalStyle />
            {/* <Suspense fallback={<div style={{ padding: 16 }}>로딩중…</div>}> */}
            <RouterProvider router={router} />
            {/* </Suspense> */}
          </PageProvider>
        </ThemeProvider>
      </ModalProvider>
    </ThemeProviderMine>
  );
}
