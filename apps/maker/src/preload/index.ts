import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("autopet", {
  appName: "maker",
  version: "0.1.0"
});
