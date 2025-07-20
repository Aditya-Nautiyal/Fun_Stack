import React, { createContext, useContext, useState } from "react";
import { registerLoaderFns } from "../utility/loaderManager";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [activeCalls, setActiveCalls] = useState(0);

  const showLoader = () => {
    setActiveCalls((count) => {
      const newCount = count + 1;
      if (newCount === 1) setLoading(true);
      return newCount;
    });
  };

  const hideLoader = () => {
    setActiveCalls((count) => {
      const newCount = Math.max(count - 1, 0);
      if (newCount === 0) setLoading(false);
      return newCount;
    });
  };

  // Register globally for axios use
  registerLoaderFns(showLoader, hideLoader);

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
