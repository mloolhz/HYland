import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import recommendRouter from "./routes/recommend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "tour_BE 서버 정상 동작 중" });
});

app.use("/api", recommendRouter);

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});