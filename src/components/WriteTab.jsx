import { useState } from 'react';
import { KanjiStrokeOrder } from './KanjiStrokeOrder';
import { WritingPad } from './WritingPad';

export function WriteTab({
  word,
  index,
  total,
  hidden,
  marked,
  padClearToken,
  onToggleHidden,
  onShowAnswer,
  onClearPad,
  onToggleMark,
  onPrev,
  onNext,
  onRandom,
}) {
  if (!word) return null;
  const [reading, kanji, meaning, category, example] = word;

  return (
    <section className="panel">
      <div className="row between">
        <span className="tag">{category}</span>
        <span className="muted">{index + 1} / {total}</span>
      </div>
      <div className="reading">{reading}</div>
      <div className="word">{hidden ? '＿＿＿' : kanji}</div>
      <div className="meaning">{meaning}</div>
      <div className="example">{example}</div>
      <KanjiStrokeOrder text={kanji} autoPlay={!hidden} />
      <WritingPad clearToken={padClearToken} />
      <div className="actions">
        <button type="button" className="primary" onClick={onToggleHidden}>
          {hidden ? 'Hiện Kanji' : 'Ẩn Kanji để tự nhớ'}
        </button>
        <button type="button" onClick={onClearPad}>Xóa nét</button>
        <button type="button" onClick={onShowAnswer}>Hiện đáp án</button>
        <button type="button" onClick={onToggleMark}>
          {marked ? '⭐ Đã đánh dấu' : '☆ Đánh dấu cần ôn'}
        </button>
      </div>
      <div className="actions">
        <button type="button" onClick={onPrev}>← Từ trước</button>
        <button type="button" className="primary" onClick={onNext}>Từ tiếp theo →</button>
        <button type="button" onClick={onRandom}>🔀 Ngẫu nhiên</button>
      </div>
      <p className="muted small">
        Vùng viết không tự động chấm nét. Hãy so sánh chữ bạn viết với đáp án sau khi luyện.
      </p>
    </section>
  );
}

export function useWriteState(wordsLength) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [padClearToken, setPadClearToken] = useState(0);

  const go = (next) => {
    setIndex(next);
    setHidden(false);
    setPadClearToken(Date.now());
  };

  return {
    index,
    hidden,
    padClearToken,
    setIndex: go,
    setHidden,
    clearPad: () => setPadClearToken(Date.now()),
    prev: () => go((index - 1 + wordsLength) % wordsLength),
    next: () => go((index + 1) % wordsLength),
    random: () => go(Math.floor(Math.random() * wordsLength)),
    showAnswer: () => setHidden(false),
    toggleHidden: () => setHidden((h) => !h),
  };
}
