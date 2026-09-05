/**
 * 이미지 업로드
 *
 *   POST /uploads/image   { dataUrl } → { url }   (로그인)
 *
 * 인증샷 검수가 사진을 전제로 하는데 업로드 경로가 없었다.
 * multer 같은 의존성을 더하지 않으려고, 프론트가 이미 만들고 있는 data URL 을
 * 그대로 받아 파일로 떨어뜨린다. 저장 위치는 public/uploads 라
 * 이미 걸려 있는 express.static("public") 이 그대로 서빙한다.
 *
 * 운영으로 가면 S3 등 외부 스토리지로 옮겨야 한다. 지금은 로컬 개발·시연용이다.
 */
import { Router, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { requireAuth } from "./auth";

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 프론트 제한과 맞춘다

/** 허용 이미지 타입 → 확장자 */
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

router.post("/image", requireAuth, (req: Request, res: Response) => {
  try {
    const { dataUrl } = req.body ?? {};
    if (typeof dataUrl !== "string") {
      return res.status(400).json({ error: "이미지 데이터가 필요해요" });
    }

    const m = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);
    if (!m) return res.status(400).json({ error: "이미지 형식을 알 수 없어요" });

    const [, mime, b64] = m;
    const ext = EXT[mime];
    if (!ext) return res.status(400).json({ error: "JPG·PNG·GIF·WEBP 만 올릴 수 있어요" });

    const buf = Buffer.from(b64, "base64");
    if (buf.byteLength > MAX_BYTES) {
      return res.status(413).json({ error: "이미지 용량은 최대 5MB까지 가능해요" });
    }

    mkdirSync(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    writeFileSync(path.join(UPLOAD_DIR, name), buf);

    // 프론트가 그대로 <img src> 에 쓸 수 있는 절대 경로로 돌려준다
    const base = `${req.protocol}://${req.get("host")}`;
    res.status(201).json({ url: `${base}/uploads/${name}`, bytes: buf.byteLength });
  } catch (err) {
    console.error("이미지 업로드 실패:", err);
    res.status(500).json({ error: "이미지를 저장하지 못했어요." });
  }
});

export default router;
