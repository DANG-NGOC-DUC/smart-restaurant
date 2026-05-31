import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Mic, MicOff, Sparkles, Trash2, X } from "lucide-react";
import {
  bulkUpsertIngredients,
  parseIngredientsAi,
} from "../../services/admin.service";

const normalizeNameKey = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : "";

const parseQuantity = (value) => {
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
  kg: ["kg", "kilo", "kilogram", "kí", "ky", "ki", "cân", "can"],
  g: ["g", "gram", "gam"],
  "lít": ["l", "lit", "lít", "litre", "liter"],
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

const normalizeUnitValue = (value) => {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!raw) return "";
  for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.includes(raw)) return canonical;
  }
  return raw;
};

const buildRowIssues = (item, existingUnit) => {
  const issues = new Set(item.sourceIssues || []);
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const unit = typeof item.unit === "string" ? item.unit.trim() : "";
  const normalizedUnit = normalizeUnitValue(unit);
  const normalizedExistingUnit = normalizeUnitValue(existingUnit || "");
  const quantity = parseQuantity(item.quantity);

  if (!name) issues.add("Thiếu tên nguyên liệu.");

  if (!normalizedUnit && !normalizedExistingUnit) {
    issues.add("Thiếu đơn vị.");
  }

  if (normalizedExistingUnit && normalizedUnit) {
    if (normalizedUnit !== normalizedExistingUnit) {
      issues.add(`Đơn vị không khớp (hệ thống: ${existingUnit}).`);
    }
  }

  if (quantity === null || quantity <= 0) {
    issues.add("Thiếu số lượng hợp lệ (> 0).");
  }

  return Array.from(issues);
};

function IngredientAiImportModal({
  open,
  onOpenChange,
  onCompleted,
  existingIngredients = [],
}) {
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSummary, setSaveSummary] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const existingUnitMap = useMemo(() => {
    const map = new Map();
    existingIngredients.forEach((ing) => {
      if (ing?.name) {
        map.set(normalizeNameKey(ing.name), ing.unit || "");
      }
    });
    return map;
  }, [existingIngredients]);

  useEffect(() => {
    if (open) {
      setInputText("");
      setItems([]);
      setParseError(null);
      setSaveError(null);
      setSpeechError(null);
      setSaveSummary(null);
      setParsing(false);
      setSaving(false);
      setIsListening(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      recognitionRef.current = null;
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setInputText((prev) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed}\n${transcript}` : transcript;
        });
      }
    };

    recognition.onerror = (event) => {
      const message =
        event?.error === "not-allowed"
          ? "Trình duyệt chưa cho phép microphone."
          : "Không thể ghi âm, vui lòng thử lại.";
      setSpeechError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  const applyExistingUnits = (parsedItems) =>
    parsedItems.map((item) => {
      const name = item.name || "";
      const key = normalizeNameKey(name);
      const existingUnit = existingUnitMap.get(key);
      return {
        name,
        unit: normalizeUnitValue(item.unit || existingUnit || ""),
        quantity:
          item.quantity === null || item.quantity === undefined
            ? ""
            : String(item.quantity),
        note: item.note || "",
        sourceIssues: item.issues || [],
      };
    });

  const handleToggleListening = () => {
    if (!speechSupported) {
      setSpeechError("Trình duyệt không hỗ trợ ghi âm.");
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setSpeechError("Không thể bắt đầu ghi âm.");
      setIsListening(false);
    }
  };

  const handleParse = async () => {
    const text = inputText.trim();
    if (!text) {
      setParseError("Vui lòng nhập nội dung trước khi phân tích.");
      return;
    }

    setParsing(true);
    setParseError(null);
    setSaveError(null);
    setSaveSummary(null);

    try {
      const res = await parseIngredientsAi(text);
      const parsedItems = Array.isArray(res.data?.items)
        ? res.data.items
        : [];
      setItems(applyExistingUnits(parsedItems));
    } catch (err) {
      setParseError(err?.response?.data?.error || err.message);
      setItems([]);
    } finally {
      setParsing(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemove = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setSaveError("Không có dòng nào để lưu.");
      return;
    }

    const cleaned = items
      .map((item) => {
        const name = typeof item.name === "string" ? item.name.trim() : "";
        const existingUnit = existingUnitMap.get(normalizeNameKey(name));
        const unit = normalizeUnitValue(item.unit || existingUnit || "");
        return {
          name: name || null,
          unit: unit || null,
          quantity: parseQuantity(item.quantity),
          note: item.note ? item.note.trim() : null,
        };
      })
      .filter(
        (item) =>
          item.name || item.unit || item.quantity !== null || item.note,
      );

    const hasIssues = cleaned.some((item) => {
      const existingUnit = existingUnitMap.get(normalizeNameKey(item.name || ""));
      const rowIssues = buildRowIssues(
        {
          name: item.name || "",
          unit: item.unit || "",
          quantity: item.quantity,
          sourceIssues: [],
        },
        existingUnit,
      );
      return rowIssues.length > 0;
    });

    if (hasIssues) {
      setSaveError("Vui lòng sửa các dòng có cảnh báo trước khi lưu.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSummary(null);

    try {
      const res = await bulkUpsertIngredients(cleaned);
      const summary = res.data?.summary || null;
      setSaveSummary(summary);

      const errors = Array.isArray(res.data?.results)
        ? res.data.results.filter((row) => row.status === "error")
        : [];

      if (errors.length > 0) {
        setSaveError("Một số dòng không thể lưu. Vui lòng kiểm tra lại.");
        setSaving(false);
        return;
      }

      if (onCompleted) {
        await onCompleted();
      }
      onOpenChange(false);
    } catch (err) {
      setSaveError(err?.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalIssues = items.reduce((acc, item) => {
    const existingUnit = existingUnitMap.get(normalizeNameKey(item.name || ""));
    return acc + buildRowIssues(item, existingUnit).length;
  }, 0);

  return (
    <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-sea-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sea-800">
              Nhập nhanh nguyên liệu bằng AI
            </h2>
            <p className="text-sm text-sea-500 mt-1">
              Nhập nhiều dòng, sau đó kiểm tra và xác nhận trước khi lưu.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sea-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {parseError}
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {saveError}
            </div>
          )}

          {speechError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              {speechError}
            </div>
          )}

          {saveSummary && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Đã xử lý {saveSummary.total} dòng (tạo mới:
              {` ${saveSummary.created}, cập nhật: ${saveSummary.updated}`}.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Nội dung nhập liệu
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="VD: vừa nhập 5kg thịt bò\n2 lít sữa tươi\n10 chai nước suối 500ml"
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-sea-400">
                Mỗi dòng là một nguyên liệu. Có thể nhập nhiều dòng.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleListening}
                  disabled={!speechSupported}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-sea-200 text-sea-600 rounded-lg hover:bg-sea-50 disabled:opacity-50"
                  title={
                    speechSupported
                      ? "Ghi âm nhập liệu"
                      : "Trình duyệt không hỗ trợ ghi âm"
                  }
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {isListening ? "Đang nghe..." : "Ghi âm"}
                </button>
                <button
                  onClick={handleParse}
                  disabled={parsing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-coral-500 text-white rounded-lg hover:bg-coral-600 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {parsing ? "Đang phân tích..." : "Phân tích"}
                </button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-sea-700">
                  Kết quả phân tích ({items.length} dòng)
                </h3>
                {totalIssues > 0 && (
                  <div className="inline-flex items-center gap-2 text-xs text-crimson-600">
                    <AlertTriangle className="w-4 h-4" />
                    {totalIssues} cảnh báo cần xử lý
                  </div>
                )}
              </div>

              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-sea-500 uppercase">
                <div className="col-span-4">Nguyên liệu</div>
                <div className="col-span-2">Số lượng</div>
                <div className="col-span-2">Đơn vị</div>
                <div className="col-span-3">Ghi chú</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const existingUnit = existingUnitMap.get(
                    normalizeNameKey(item.name || ""),
                  );
                  const issues = buildRowIssues(item, existingUnit);

                  return (
                    <div key={index} className="space-y-1">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <input
                          className="col-span-4 px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          placeholder="Tên nguyên liệu"
                        />
                        <input
                          className="col-span-2 px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          placeholder="Số lượng"
                        />
                        <input
                          className="col-span-2 px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                          value={item.unit}
                          onChange={(e) =>
                            handleItemChange(index, "unit", e.target.value)
                          }
                          placeholder={existingUnit || "Đơn vị"}
                        />
                        <input
                          className="col-span-3 px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                          value={item.note}
                          onChange={(e) =>
                            handleItemChange(index, "note", e.target.value)
                          }
                          placeholder="Ghi chú (tuỳ chọn)"
                        />
                        <button
                          onClick={() => handleRemove(index)}
                          className="col-span-1 inline-flex items-center justify-center p-2 text-crimson-500 hover:bg-crimson-50 rounded-lg"
                          title="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {issues.length > 0 && (
                        <div className="text-xs text-crimson-600">
                          {issues.join(" ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-sea-100 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="flex-1 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Xác nhận & Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientAiImportModal;
