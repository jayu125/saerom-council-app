import { useContext, useCallback, useState, createContext } from "react";
import { ThemeProvider as StyledProvider } from "styled-components";
import { darkTheme, lightTheme } from "./theme";

const ThemeContext = createContext({});

const ThemeProviderMine = ({ children }) => {
  const [ThemeMode, setThemeMode] = useState("dark");
  const themeObject = ThemeMode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ ThemeMode, setThemeMode }}>
      <StyledProvider theme={themeObject}>{children}</StyledProvider>
    </ThemeContext.Provider>
  );
};

function useTheme() {
  const context = useContext(ThemeContext);
  const { ThemeMode, setThemeMode } = context;

  const toggleTheme = useCallback(() => {
    if (ThemeMode === "light") {
      setThemeMode("dark");
    } else {
      setThemeMode("light");
    }
  }, [ThemeMode]);

  return [ThemeMode, toggleTheme];
}

export { ThemeProviderMine, useTheme };
