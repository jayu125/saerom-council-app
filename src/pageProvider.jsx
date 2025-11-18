import { createContext, useContext, useEffect, useState } from "react";

const PageContext = createContext(null);

const PageProvider = ({ children }) => {
  const [page, setPage] = useState("캘린더");
  useEffect(() => {
    console.log(page);
  }, [page]);
  return (
    <PageContext.Provider value={{ page, setPage }}>
      {children}
    </PageContext.Provider>
  );
};

function usePage() {
  const context = useContext(PageContext);
  const { page, setPage } = context;
  return [page, setPage];
}

export { PageProvider, usePage };
