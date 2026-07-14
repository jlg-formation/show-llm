import "./style.css";
import { createApp } from "./app";
import { store } from "./store";

const root = document.querySelector<HTMLDivElement>("#app");
if (root) {
  root.append(createApp());
  // Notifie les abonnés avec l'état initial (étape 0).
  store.set({});
}
