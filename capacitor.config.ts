import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "tetris",
  webDir: "dist",
  server: {
    androidScheme: "http",
  },
};

export default config;
