import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StatusBar } from "@capacitor/status-bar";
import { NavigationBar } from "@capgo/capacitor-navigation-bar";

StatusBar.setBackgroundColor({ color: "#585b70" });
NavigationBar.setNavigationBarColor({ color: "#585b70" });
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
