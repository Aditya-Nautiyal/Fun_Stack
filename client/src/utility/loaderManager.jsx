// src/context/loaderManager.js
let showLoaderFn = () => {};
let hideLoaderFn = () => {};

export const registerLoaderFns = (showFn, hideFn) => {
  showLoaderFn = showFn;
  hideLoaderFn = hideFn;
};

export const showLoader = () => showLoaderFn();
export const hideLoader = () => hideLoaderFn();
