import sharp from "sharp";
import { randomBytes } from "crypto";
import { mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

export interface CardParams {
  imagePath: string; // local path to original upload
  cityName: string;
  date: string; // YYYY-MM-DD
  brandName: string;
  drinkName: string;
  caption?: string;
}

const CARD_WIDTH = 1080;
const TOP_PADDING = 120;
const TEXT_BLOCK_PADDING = 60;
const TEXT_SIDE_PADDING = 60;
const PRIMARY_COLOR = "#1F2937";
const MUTED_COLOR = "#6B7280";
const CARD_DIR = join(process.cwd(), "public", "cards");

function buildTextSvg(
  cityName: string,
  date: string,
  brandName: string,
  drinkName: string,
  caption?: string
): string {
  const line1 = `<tspan x="${TEXT_SIDE_PADDING}" dy="0" font-size="28" fill="${MUTED_COLOR}" font-family="sans-serif">${escapeXml(cityName)} · ${escapeXml(date)}</tspan>`;
  const line2 = `<tspan x="${TEXT_SIDE_PADDING}" dy="44" font-size="40" font-weight="bold" fill="${PRIMARY_COLOR}" font-family="sans-serif">${escapeXml(brandName)} · ${escapeXml(drinkName)}</tspan>`;

  let captionLine = "";
  if (caption && caption.trim().length > 0) {
    captionLine = `<tspan x="${TEXT_SIDE_PADDING}" dy="52" font-size="26" fill="${MUTED_COLOR}" font-family="sans-serif">${escapeXml(caption.trim())}</tspan>`;
  }

  const textLines = 2 + (captionLine ? 1 : 0);
  const textBlockHeight = 24 + textLines * 52;

  return `<svg width="${CARD_WIDTH}" height="${textBlockHeight}" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="24" font-family="sans-serif">
    ${line1}
    ${line2}${captionLine ? "\n    " + captionLine : ""}
  </text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generateCard(params: CardParams): Promise<string | null> {
  try {
    const { imagePath, cityName, date, brandName, drinkName, caption } =
      params;

    // Ensure cards directory exists
    if (!existsSync(CARD_DIR)) {
      mkdirSync(CARD_DIR, { recursive: true });
    }

    // Read and process the original image
    const imageBuffer = readFileSync(imagePath);
    const metadata = await sharp(imageBuffer).metadata();

    if (!metadata.width) {
      return null;
    }

    // Scale image to 1080px wide, maintaining aspect ratio
    const scaledImage = await sharp(imageBuffer)
      .resize(CARD_WIDTH, undefined, {
        fit: "inside",
        withoutEnlargement: false,
      })
      .toBuffer();

    const scaledMetadata = await sharp(scaledImage).metadata();
    const imageHeight = scaledMetadata.height ?? 0;

    // Build text SVG
    const textSvg = buildTextSvg(cityName, date, brandName, drinkName, caption);

    // Convert SVG to PNG buffer for compositing
    const textSvgBuffer = Buffer.from(textSvg);
    const textOverlay = await sharp(textSvgBuffer).png().toBuffer();

    const textOverlayMetadata = await sharp(textOverlay).metadata();
    const textHeight = textOverlayMetadata.height ?? 120;

    // Calculate total canvas height
    const canvasHeight = TOP_PADDING + imageHeight + TEXT_BLOCK_PADDING + textHeight;

    // Create white background canvas
    const canvas = await sharp({
      create: {
        width: CARD_WIDTH,
        height: canvasHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg({ quality: 92 })
      .composite([
        {
          input: scaledImage,
          top: TOP_PADDING,
          left: 0,
        },
        {
          input: textOverlay,
          top: TOP_PADDING + imageHeight + TEXT_BLOCK_PADDING,
          left: 0,
        },
      ])
      .toBuffer();

    // Generate filename and save
    const timestamp = Date.now();
    const random = randomBytes(4).toString("hex");
    const filename = `card-${timestamp}-${random}.jpg`;
    const outputPath = join(CARD_DIR, filename);

    await sharp(canvas).jpeg({ quality: 92 }).toFile(outputPath);

    return `/cards/${filename}`;
  } catch (error) {
    console.error("Card generation failed:", error);
    return null;
  }
}
