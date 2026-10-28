import { useCallback, useEffect, useMemo, useState } from 'react';

function buildOptions(words, w) {
  const opts = [w];
  while (opts.length < 4) {
    const x = words[Math.floor(Math.random() * words.length)];
    if (!opts.includes(x)) opts.push(x);
  }
  return opts.sort(() => Math.random() - 0.5);
}

export function QuizTab({ words, lessonId, onWrong, onScoreChange }) {
  const [order, setOrder] = useState([]);
  const [qi, setQi] = useState(0);
  const [qScore, setQScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('Chọn đáp án đúng.');
  const [pickedKanji, setPickedKanji] = useState(null);
  const [optionsSeed, setOptionsSeed] = useState(0);

  const startQuiz = useCallback(() => {
    const o = [...words.keys()].sort(() => Math.random() - 0.5);
    setOrder(o);
    setQi(0);
    setQScore(0);
    setAnswered(false);
    setFeedback('Chọn đáp án đúng.');
    setPickedKanji(null);
    setOptionsSeed((s) => s + 1);
  }, [words]);

  useEffect(() => {
    startQuiz();
  }, [lessonId, startQuiz]);

  useEffect(() => {
    onScoreChange(qScore, qi);
  }, [qScore, qi, onScoreChange]);

  const done = order.length > 0 && qi >= order.length;
  const wordIdx = order.length ? order[qi] : 0;
  const w = !order.length || done ? null : words[wordIdx];

  const options = useMemo(() => {
    if (!w) return [];
    return buildOptions(words, w);
  }, [words, w, optionsSeed]);

  if (!order.length) return null;

  function pickOption(o, correct) {
    if (answered || !correct) return;
    setAnswered(true);
    setPickedKanji(o[1]);
    if (o === correct) {
      setQScore((s) => s + 1);
      setFeedback(`Đúng rồi! ${correct[1]} — ${correct[2]}`);
    } else {
      setFeedback(`Đáp án đúng: ${correct[1]} — ${correct[2]}`);
      onWrong(wordIdx);
    }
  }

  function optionClass(kanji, correctKanji) {
    if (!answered) return '';
    if (kanji === correctKanji) return 'correct';
    if (kanji === pickedKanji) return 'wrong';
    return '';
  }

  function goNextQuestion() {
    setAnswered(false);
    setFeedback('Chọn Kanji đúng.');
    setPickedKanji(null);
    setOptionsSeed((s) => s + 1);
    setQi((q) => q + 1);
  }

  return (
    <section className="panel">
      <div className="row between">
        <h2 className="section-title">Chọn Kanji đúng</h2>
        <span className="tag">
          {done ? 'Hoàn thành' : `Câu ${qi + 1}/${order.length}`}
        </span>
      </div>
      <div className="progress">
        <div style={{ width: done ? '100%' : `${(qi / order.length) * 100}%` }} />
      </div>
      {done ? (
        <>
          <div className="word">おつかれさま！</div>
          <div className="meaning">Bạn đúng {qScore}/{order.length} câu.</div>
          <p className="muted">{feedback || 'Ôn các từ đã đánh dấu rồi thử lại.'}</p>
        </>
      ) : (
        <>
          <div className="reading">Hiragana / cách đọc</div>
          <div className="word">{w[0]}</div>
          <div className="meaning">{w[2]}</div>
          <div className="options">
            {options.map((o) => (
              <button
                key={o[1] + o[0]}
                type="button"
                className={optionClass(o[1], w[1])}
                onClick={() => pickOption(o, w)}
              >
                {o[1]}
              </button>
            ))}
          </div>
          <p aria-live="polite">{feedback}</p>
        </>
      )}
      <div className="actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (done) {
              startQuiz();
              return;
            }
            if (!answered) {
              setFeedback('Chọn một đáp án trước nhé.');
              return;
            }
            goNextQuestion();
          }}
        >
          {done ? 'Làm lại bài' : 'Câu tiếp theo →'}
        </button>
        <button type="button" onClick={startQuiz}>Làm lại bài</button>
      </div>
    </section>
  );
}
