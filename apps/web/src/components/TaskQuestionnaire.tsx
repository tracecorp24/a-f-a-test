import { useId, useState } from "react";
import { Modal } from "./UI";

export type TaskQuestion = readonly [string, ...string[]];

const OTHER_LABEL = "Diğer (kendi cevabını yaz)";

export function TaskQuestionnaire({
  questions,
  answers,
  onAnswer,
  instruction,
  onInstruction,
  disabled = false,
  multiple = false,
  onFinished,
  finishedLabel,
}: {
  questions: readonly TaskQuestion[];
  /** One entry per question: the selected option(s). Single-select keeps at most one. */
  answers: readonly (readonly string[])[];
  onAnswer: (index: number, selected: readonly string[]) => void;
  instruction: string;
  onInstruction: (instruction: string) => void;
  disabled?: boolean;
  /** Allow selecting several options per question (rendered as checkboxes). Boolean or per-question predicate. */
  multiple?: boolean | ((index: number) => boolean);
  /** Soru setinin sonunda gösterilecek, bir sonraki adıma geçiren buton. */
  onFinished?: () => void;
  finishedLabel?: string;
}) {
  const groupId = useId();
  const [draft, setDraft] = useState(instruction);
  const [index, setIndex] = useState(0);
  const [otherDraft, setOtherDraft] = useState("");
  const [otherOpen, setOtherOpen] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const current = questions[index];
  if (!current) return null;
  const [question, ...options] = current;
  const multi = typeof multiple === "function" ? multiple(index) : multiple;
  const selected = answers[index] ?? [];
  const isLast = index >= questions.length - 1;
  const answeredCount = answers.filter((entry) => (entry ?? []).length > 0).length;
  const allAnswered = answeredCount === questions.length;
  // "Diğer" seçeneği: hazır şıkların dışında kalan serbest metin
  const otherValue = selected.find((entry) => !options.includes(entry)) ?? "";

  function setOtherValue(text: string) {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed) {
      onAnswer(index, selected.filter((entry) => options.includes(entry)));
    } else if (multi) {
      onAnswer(index, [...selected.filter((entry) => options.includes(entry)), trimmed]);
    } else {
      onAnswer(index, [trimmed]);
    }
  }

  function toggle(option: string) {
    if (disabled) return;
    if (!multi) {
      // Clicking the selected option again clears it; clicking another replaces it.
      const next = selected[0] === option ? [] : [option];
      onAnswer(index, next);
      return;
    }
    const next = selected.includes(option) ? selected.filter((entry) => entry !== option) : [...selected, option];
    onAnswer(index, options.filter((entry) => next.includes(entry)).concat(selected.filter((entry) => !options.includes(entry))));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <fieldset className="arena-card arena-card-pad" disabled={disabled}>
        <legend>Soru {index + 1}/{questions.length} · {question}</legend>
        <div className="task-question-options">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <label key={option} className="task-option" data-selected={isSelected || undefined}>
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={`${groupId}-${index}`}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => toggle(option)}
                />
                <span>{option}</span>
                {multi && isSelected && <em>seçili</em>}
              </label>
            );
          })}
          <label className="task-option task-option-other" data-selected={Boolean(otherValue) || otherOpen || undefined}>
            <input
              type={multi ? "checkbox" : "radio"}
              name={`${groupId}-${index}`}
              checked={Boolean(otherValue)}
              disabled={disabled}
              onChange={() => {
                setOtherOpen(true);
                if (!multi) onAnswer(index, otherValue.trim() ? [otherValue.trim()] : []);
              }}
            />
            <span>{OTHER_LABEL}</span>
          </label>
          {otherOpen && (
            <input
              className="arena-input task-other-input"
              placeholder="Cevabını buraya yaz (boş bırakabilirsin)…"
              maxLength={400}
              disabled={disabled}
              value={otherDraft || otherValue}
              onChange={(event) => {
                setOtherDraft(event.target.value);
                setOtherValue(event.target.value);
              }}
            />
          )}
        </div>
        <p className="task-block-help" role="status">
          {multi ? "Birden fazla seçenek seçebilirsin." : "Bir seçenek seç; tekrar basarsan seçim temizlenir."}
          {" "}Seçim anında kaydedilir.
        </p>
      </fieldset>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" className="arena-btn" disabled={disabled || index === 0} onClick={() => setIndex(index - 1)}>← Önceki Soru</button>
        {!isLast && (
          <button type="button" className="arena-btn" disabled={disabled} onClick={() => setIndex(index + 1)}>Sonraki Soru →</button>
        )}
        {isLast && onFinished && (
          <button type="button" className="arena-btn arena-btn-primary" disabled={disabled} onClick={onFinished}>
            {finishedLabel ?? "Devam Et →"}
          </button>
        )}
        <span role="status">{answeredCount}/{questions.length} yanıtlandı</span>
        {allAnswered && isLast && onFinished && <span role="status" style={{ color: "var(--accent, #53cbe8)" }}>Tüm sorular yanıtlandı — devam edebilirsin.</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="arena-btn" disabled={disabled} onClick={() => setInstructionOpen(true)}>
          ✎ Ek Talimat {instruction ? "(mevcut)" : "(boş bırakılabilir)"}
        </button>
        {instruction && <span style={{ overflowWrap: "anywhere" }}>Uygulanan talimat: {instruction}</span>}
      </div>
      {instructionOpen && (
        <Modal title="Ek talimat veya değişiklik isteği" onClose={() => setInstructionOpen(false)}>
          <textarea
            className="arena-textarea"
            rows={6}
            maxLength={4000}
            disabled={disabled}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Boş bırakabilirsin. Yazarsan sorular bu talimata göre güncellenir."
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              className="arena-btn arena-btn-primary"
              disabled={disabled || draft.trim() === instruction}
              onClick={() => { setInstructionOpen(false); onInstruction(draft.trim()); }}
            >
              Talimatla Soruları Güncelle
            </button>
            <button type="button" className="arena-btn" onClick={() => setInstructionOpen(false)}>Vazgeç</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
