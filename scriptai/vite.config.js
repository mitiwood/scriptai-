import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // 이 부분을 추가하여 경로를 상대 경로로 바꿉니다.
});
