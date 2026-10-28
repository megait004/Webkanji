import { useMemo, useState } from 'react';
import { KanjiStrokeOrder } from './KanjiStrokeOrder';

export function FlashcardTab({ words, lessonMarks, onToggleMark, onPracticeWord }) {
  const [order, setOrder] = useState(() => shuffleIndices(words.length));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState('kanji'); // kanji | reading | meaning

  const idx = order[pos] ?? 0;
  const word = words[idx];
  const marked = lessonMarks.has(idx);

  const frontContent = useMemo(() => {
    if (!word) return { label: '', main: '' };
    const [reading, kanji, meaning] = word;
    if (mode === 'reading') return { label: 'Nhớ Kanji từ cách đọc', main: reading, sub: meaning };
    if (mode === 'meaning') return { label: 'Nhớ Kanji từ nghĩa', main: meaning, sub: reading };
    return { label: 'Nhớ nghĩa & cách đọc', main: kanji, sub: reading };
  }, [word, mode]);

  function goNext() {
    setFlipped(false);
    setPos((p) => (p + 1 >= order.length ? 0 : p + 1));
  }

  function goPrev() {
    setFlipped(false);
    setPos((p) => (p - 1 < 0 ? order.length - 1 : p - 1));
  }

  function reshuffle() {
    setOrder(shuffleIndices(words.length));
    setPos(0);
    setFlipped(false);
  }

  if (!word) return null;

  const [reading, kanji, meaning, category, example] = word;

  return (
    <section className="panel flash-panel">
      <div className="row between">
        <div>
          <h2 className="section-title">Thẻ bài (flashcard)</h2>
          <p className="muted small">Chạm thẻ hoặc bấm “Lật thẻ” · Ôn nhanh trước khi viết</p>
        </div>
        <span className="tag">{pos + 1} / {order.length}</span>
      </div>

      <div className="flash-controls row">
        <label className="muted small">Mặt trước hiển thị:</label>
        <select value={mode} onChange={(e) => { setMode(e.target.value); setFlipped(false); }}>
          <option value="kanji">Kanji lớn</option>
          <option value="reading">Hiragana / đọc</option>
          <option value="meaning">Nghĩa tiếng Việt</option>
        </select>
        <button type="button" onClick={reshuffle}>🔀 Trộn thẻ</button>
      </div>

      <button
        type="button"
        className={`flashcard ${flipped ? 'is-flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Ẩn đáp án' : 'Lật thẻ xem đáp án'}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="flash-label">{frontContent.label}</span>
            <div className="flash-main">{frontContent.main}</div>
            {mode !== 'kanji' && <div className="flash-hint muted">{frontContent.sub}</div>}
            <span className="flash-tip muted small">Bấm để lật</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="tag">{category}</span>
            <div className="flash-kanji">{kanji}</div>
            <div className="flash-reading">{reading}</div>
            <div className="flash-meaning">{meaning}</div>
            <p className="flash-example muted small">{example}</p>
          </div>
        </div>
      </button>

      {flipped && (
        <KanjiStrokeOrder text={kanji} compact autoPlay={false} />
      )}

      <div className="actions">
        <button type="button" onClick={goPrev}>← Thẻ trước</button>
        <button type="button" className="primary" onClick={() => setFlipped((f) => !f)}>
          {flipped ? 'Ẩn đáp án' : 'Lật thẻ'}
        </button>
        <button type="button" onClick={goNext}>Thẻ sau →</button>
      </div>

      <div className="actions">
        <button
          type="button"
          onClick={() => onToggleMark(idx)}
        >
          {marked ? '⭐ Đã đánh dấu khó' : '☆ Đánh dấu khó'}
        </button>
        <button type="button" className="primary" onClick={() => onPracticeWord(idx)}>
          ✍️ Luyện viết từ này
        </button>
      </div>

      <div className="flash-progress">
        <div className="progress"><div style={{ width: `${((pos + 1) / order.length) * 100}%` }} /></div>
        <span className="muted small">Tiến độ bộ thẻ</span>
      </div>
    </section>
  );
}

function shuffleIndices(n) {
  const arr = [...Array(n).keys()];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
