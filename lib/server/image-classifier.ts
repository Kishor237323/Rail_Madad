import { readFile } from "fs/promises";
import path from "path";

type TrainImageClassificationInput = {
  imagePath: string;
  description?: string;
};

export type TrainImageClassificationResult = {
  category: string;
  confidence: number | null;
  rawCategory: string;
};

const EXTENSION_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
};

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

function mapModelCategoryToInternal(value: string) {
  const label = normalizeLabel(value);

 
  const directMappings: Record<string, string> = {
    "tap_issue": "tap_issue",
    "switch_issue": "switch_issue",
    "socket_issue": "socket_issue",
    "seat_issue": "seat_issue",
    "light_not_working": "light_not_working",
    "floor_cleanliness": "floor_cleanliness",
    "fan_not_working": "fan_not_working",
    "dirty_toilet": "dirty_toilet",
  };

  
  return directMappings[label] || null;
}

function extractCategoryAndConfidence(payload: unknown) {
  const source = Array.isArray(payload) ? payload[0] : payload;
  if (!source || typeof source !== "object") return null;

  const item = source as Record<string, unknown>;
  const rawCategory =
    String(
      item.category ??
        item.label ??
        item.prediction ??
        item.predicted_class ??
        item.predictedCategory ??
        item.class ??
        ""
    ).trim();

  if (!rawCategory) return null;

  const confidenceRaw = item.confidence ?? item.score ?? item.probability ?? null;
  const confidence = typeof confidenceRaw === "number" ? Number(confidenceRaw.toFixed(4)) : null;

  return { rawCategory, confidence };
}

export async function classifyTrainComplaintImage(
  input: TrainImageClassificationInput
): Promise<TrainImageClassificationResult | null> {
  const endpoint = process.env.MODEL_INFERENCE_URL?.trim();
  if (!endpoint) return null;

  const normalizedPath = input.imagePath.startsWith("/") ? input.imagePath.slice(1) : input.imagePath;
  const absoluteImagePath = path.join(process.cwd(), "public", normalizedPath);

  let imageBuffer: Buffer;
  try {
    imageBuffer = await readFile(absoluteImagePath);
    console.log(`[Image Classifier] Read image: ${absoluteImagePath} (${imageBuffer.length} bytes)`);
  } catch (err) {
    console.error(`[Image Classifier] Failed to read image: ${absoluteImagePath}`, err);
    return null;
  }

  const extension = path.extname(absoluteImagePath).toLowerCase();
  const mimeType = EXTENSION_TO_MIME[extension] || "application/octet-stream";
  const filename = path.basename(absoluteImagePath);

  console.log(`[Image Classifier] Sending to Colab: ${filename} (type: ${mimeType}, size: ${imageBuffer.length} bytes)`);

  const formData = new FormData();
  const bytes = new Uint8Array(imageBuffer);
  formData.append("image", new Blob([bytes], { type: mimeType }), filename);
  if (input.description) {
    formData.append("description", input.description);
    console.log(`[Image Classifier] Description: ${input.description}`);
  }

  const headers: Record<string, string> = {};
  if (process.env.MODEL_API_KEY) {
    headers.Authorization = `Bearer ${process.env.MODEL_API_KEY}`;
  }

  try {
    console.log(`[Image Classifier] Requesting ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: formData,
    });

    console.log(`[Image Classifier] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Image Classifier] Colab API error: ${errorText}`);
      return null;
    }

    const payload = (await response.json()) as unknown;
    console.log(`[Image Classifier] Raw response: ${JSON.stringify(payload)}`);
    
    const parsed = extractCategoryAndConfidence(payload);
    if (!parsed) {
      console.warn(`[Image Classifier] Failed to extract category/confidence from response`);
      return null;
    }

    console.log(`[Image Classifier] Parsed - Raw: ${parsed.rawCategory}, Confidence: ${parsed.confidence}`);

    const mappedCategory = mapModelCategoryToInternal(parsed.rawCategory);
    if (!mappedCategory) {
      console.warn(`[Image Classifier] Could not map category "${parsed.rawCategory}" to internal category`);
      return null;
    }

    console.log(`[Image Classifier] Final - Category: ${mappedCategory}, Confidence: ${parsed.confidence}`);

    return {
      category: mappedCategory,
      confidence: parsed.confidence,
      rawCategory: parsed.rawCategory,
    };
  } catch (err) {
    console.error(`[Image Classifier] Network/fetch error:`, err);
    return null;
  }
}
