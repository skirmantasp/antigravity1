import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const GlobalStyles = () => (
    <style>{`
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #0f172a;
      color: #e2e8f0;
    }
    input[type="range"] {
      -webkit-appearance: none;
      background: transparent;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background: #38bdf8;
      cursor: pointer;
      margin-top: -6px;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: 6px;
      cursor: pointer;
      background: #334155;
      border-radius: 3px;
    }
    /* Simple custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
  `}</style>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <GlobalStyles />
        <App />
    </React.StrictMode>
);
