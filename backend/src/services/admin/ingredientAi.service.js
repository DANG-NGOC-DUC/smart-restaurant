const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

const SYSTEM_PROMPT =
  "Bạn là bộ phân tích nhập nguyên liệu. " +
  "Chỉ trả về JSON thuần, không markdown, không giải thích. " +
  "Mỗi dòng có thể là 1 nguyên liệu; nếu một dòng có nhiều nguyên liệu, hãy tách riêng. " +
  "Schema: [{name, quantity, unit, note, confidence}]. " +
  "Nếu thiếu số lượng hoặc đơn vị, để null. " +
  "confidence nằm trong khoảng 0-1.";

const buildUserPrompt = (text) =>
  `Phân tích đoạn sau và trả về JSON theo schema đã nêu:\n${text}`;

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCandidateModels = () => {
  const primaryModel = normalizeText(process.env.GEMINI_MODEL);
  const fallbackModels = normalizeText(process.env.GEMINI_MODEL_FALLBACKS)
    .split(",")
    .map((model) => normalizeText(model))
    .filter(Boolean);

  return [
    ...new Set([
      primaryModel || DEFAULT_GEMINI_MODELS[0],
      ...fallbackModels,
      ...DEFAULT_GEMINI_MODELS,
    ]),
  ];
};

const isTransientGeminiError = (error) => {
  const message = normalizeText(error?.message).toLowerCase();
  const statusCode = Number(error?.statusCode || error?.status || 0);

  if ([429, 500, 503].includes(statusCode)) {
    return true;
  }

  return (
    message.includes("high demand") ||
    message.includes("spikes in demand") ||
    message.includes("please try again later") ||
    message.includes("temporarily unavailable") ||
    message.includes("resource exhausted") ||
    message.includes("overloaded") ||
    message.includes("quota")
  );
};

const callGemini = async (model, text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY trong môi trường.");
  }

  const url = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  if (typeof fetch !== "function") {
    throw new Error("Fetch API không sẵn sàng. Vui lòng dùng Node 18+.");
  }

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: buildUserPrompt(text) }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || "Gọi Gemini thất bại.");
    error.statusCode = response.status;
    error.retryable = isTransientGeminiError(error);
    throw error;
  }

  return {
    rawText:
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("") || "",
  };
};

const parseNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, ".").replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};

const UNIT_ALIASES = {
  kg: ["kg", "kilo", "kilogram", "kí", "ky", "cân", "can"],
  g: ["g", "gram", "gam"],
  lít: ["l", "lit", "lít"],
  ml: ["ml", "milliliter", "mililiter"],
  chai: ["chai", "bottle"],
  hộp: ["hộp", "hop", "box"],
  gói: ["gói", "goi", "pack"],
  quả: ["quả", "qua"],
  con: ["con"],
  bó: ["bó", "bo"],
  miếng: ["miếng", "mieng"],
  lá: ["lá", "la"],
  muỗng: ["muỗng", "muong"],
};

const normalizeUnit = (value) => {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.includes(raw)) return canonical;
  }
  return raw;
};

const extractJson = (raw) => {
  if (!raw) {
    throw new Error("Không nhận được dữ liệu từ Gemini.");
  }

  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return JSON.parse(trimmed.slice(arrayStart, arrayEnd + 1));
  }

  const objStart = trimmed.indexOf("{");
  const objEnd = trimmed.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return JSON.parse(trimmed.slice(objStart, objEnd + 1));
  }

  throw new Error("Không thể parse JSON từ Gemini.");
};

const normalizeItem = (item) => {
  const name = normalizeText(item?.name);
  const quantity = parseNumber(item?.quantity);
  const unit = normalizeUnit(item?.unit);
  const note = normalizeText(item?.note) || null;
  const confidence = parseNumber(item?.confidence);

  const issues = [];
  if (!name) issues.push("Thiếu tên nguyên liệu.");
  if (quantity === null) issues.push("Thiếu số lượng.");
  if (!unit) issues.push("Thiếu đơn vị.");

  return {
    name: name || null,
    quantity,
    unit,
    note,
    confidence,
    issues,
  };
};

export const parseIngredientsFromText = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Nội dung nhập liệu đang trống.");
  }

  let lastError = null;

  for (const model of getCandidateModels()) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const { rawText } = await callGemini(model, text);
        const parsed = extractJson(rawText);
        const items = Array.isArray(parsed) ? parsed : parsed?.items;

        if (!Array.isArray(items)) {
          throw new Error("Gemini trả về dữ liệu không hợp lệ.");
        }

        const normalizedItems = items
          .map(normalizeItem)
          .filter(
            (item) =>
              item.name || item.unit || item.quantity !== null || item.note,
          );

        return {
          model,
          items: normalizedItems,
        };
      } catch (error) {
        lastError = error;
        const shouldRetry = error?.retryable && attempt < 3;
        if (!shouldRetry) {
          break;
        }

        await delay(250 * attempt);
      }
    }

    if (!isTransientGeminiError(lastError)) {
      break;
    }
  }

  if (isTransientGeminiError(lastError)) {
    const error = new Error(
      "Gemini đang quá tải. Vui lòng thử lại sau vài giây.",
    );
    error.statusCode = 503;
    throw error;
  }

  throw lastError || new Error("Gọi Gemini thất bại.");
};
