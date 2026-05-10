import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("autopet", {
  appName: "runtime",
  version: "0.1.0"
});
