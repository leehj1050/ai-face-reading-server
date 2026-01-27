import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { upload } from "./middleware/upload";

import validateRoute from "./routes/validate";
import analyzeRoute from "./routes/analyze";

import { MulterError } from "multer";


dotenv.config();

const app = express();
app.use(cors());

// 🔥 multer는 여기서 제거
app.use("/api/validate", upload.single("image"), validateRoute);
app.use("/api/analyze", upload.single("image"), analyzeRoute);

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ⚠️ 반드시 모든 app.use / app.post 뒤에 위치
app.use((err: any, _req: any, res: any, _next: any) => {
  // ✅ multer 파일 사이즈 초과
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        reason: "IMAGE_TOO_LARGE",
        maxSizeMB: 5,
      });
    }
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    reason: "SERVER_ERROR",
  });
});
