import { useState } from "react";

export type TaskQuestion = readonly [string, ...string[]];

export function TaskQuestionnaire({
  questions,
  answers,
  onAnswer,
  instruction,
  onInstruction,
  disabled = false,
}: {
  questions: readonly TaskQuestion[];
  answers: string[];
  onAnswer: (index: number, answer: string) => void;
  instruction: string;
  onInstruction: (instruction: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(instruction);
  const [index, setIndex] = useState(0);
  const current = questions[index];
  if (!current) return null;
  const [question, ...options] = current;

  return (
    <div style={{ display: "grid", gap: 16 }}>
        <fieldset className="arena-card arena-card-pad" disabled={disabled}>
          <legend>Soru {index + 1}/{questions.length} · {question}</legend>
          <div style={{ display: "grid", gap: 12 }}>
            {options.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={question}
                  checked={answers[index] === option}
                  onChange={() => onAnswer(index, option)}
                /> {option}
              </label>
            ))}
          </div>
        </fieldset>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="arena-btn" disabled={disabled || index === 0} onClick={() => setIndex(index - 1)}>← Önceki Soru</button>
        <button type="button" className="arena-btn" disabled={disabled || !answers[index] || index === questions.length - 1} onClick={() => setIndex(index + 1)}>Sonraki Soru →</button>
        <span role="status">{answers.filter(Boolean).length}/{questions.length} yanıtlandı</span>
      </div>
      <label>
        Ek talimat veya değişiklik isteği
        <textarea className="arena-textarea" rows={3} maxLength={4000} disabled={disabled} value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div>
        <button type="button" className="arena-btn" disabled={disabled || draft.trim() === instruction} onClick={() => onInstruction(draft.trim())}>
          Talimatla Soruları Güncelle
        </button>
        {instruction && <p style={{ overflowWrap: "anywhere" }}>Uygulanan talimat: {instruction}</p>}
      </div>
    </div>
  );
}
