import { Router } from "express";
import {
  RekognitionClient,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";


const router = Router();

router.post("/", async (req, res) => {

  const client = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
  
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, reason: "NO_IMAGE" });
    }

    const command = new DetectFacesCommand({
      Image: { Bytes: file.buffer },
      Attributes: [],
    });

    const result = await client.send(command);
    const faceCount = result.FaceDetails?.length ?? 0;

    if (faceCount === 0)
      return res.json({ success: false, reason: "NO_FACE" });

    if (faceCount > 1)
      return res.json({ success: false, reason: "MULTIPLE_FACES" });

    return res.json({ success: true, faceCount: 1 });
  } catch (err: any) {
    if (err.name === "ValidationException") {
      return res.status(413).json({
        success: false,
        reason: "IMAGE_TOO_LARGE",
        maxSizeMB: 5,
      });
    }

    console.error("Error ::: " ,err);
    return res.status(500).json({ success: false, reason: "UNKNOWN_ERROR" });
  }
});

export default router;
