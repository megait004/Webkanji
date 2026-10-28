import { useCallback, useState } from 'react';
import { LESSONS, LESSON_IDS } from './data/lessons';
import { usePersistedMarks } from './hooks/usePersistedMarks';
import { FlashcardTab } from './components/FlashcardTab';
import { QuizTab } from './components/QuizTab';
import { VocabListTab } from './components/VocabListTab';
import { WriteTab, useWriteState } from './components/WriteTab';

const TABS = [
  { id: 'write', label: '✍️ Luyện viết' },
  { id: 'flash', label: '🃏 Thẻ bài' },
  { id: 'quiz', label: '🧠 Kiểm tra' },
  { id: 'list', label: '📚 Từ vựng' },
];

export default function App() {
  const [lessonId, setLessonId] = useState('12');
  const [tab, setTab] = useState('write');
  const [quizScore, setQuizScore] = useState({ score: 0, answered: 0 });
  const { marks, toggleMark, clearLessonMarks } = usePersistedMarks();

  const lesson = LESSONS[lessonId];
  const words = lesson.words;
  const lessonMarks = marks[lessonId] || new Set();

  const write = useWriteState(words.length);

  const changeLesson = (id) => {
    setLessonId(id);
    write.setIndex(0);
  };

  const onScoreChange = useCallback((score, answered) => {
    setQuizScore({ score, answered });
  }, []);

  const onQuizWrong = useCallback(
    (index) => toggleMark(lessonId, index),
    [lessonId, toggleMark],
  );

  const goPractice = (index) => {
    write.setIndex(index);
    setTab('write');
  };

  return (
    <>
      <header>
        <div>
          <h1>Kanji luyện viết ✍️</h1>
          <p>Ôn theo từng bài · 初中級 · Viết bằng chuột, ngón tay hoặc bút cảm ứng</p>
        </div>
      </header>
      <main>
        <section className="panel">
          <div className="row between">
            <div>
              <b>Chọn bài muốn học</b>
              <div className="muted small">Từ vựng, thẻ bài và kiểm tra tách riêng theo bài</div>
            </div>
            <select value={lessonId} onChange={(e) => changeLesson(e.target.value)}>
              {LESSON_IDS.map((id) => (
                <option key={id} value={id}>{LESSONS[id].label}</option>
              ))}
            </select>
          </div>
        </section>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'write' && (
          <WriteTab
            word={words[write.index]}
            index={write.index}
            total={words.length}
            hidden={write.hidden}
            marked={lessonMarks.has(write.index)}
            padClearToken={write.padClearToken}
            onToggleHidden={write.toggleHidden}
            onShowAnswer={write.showAnswer}
            onClearPad={write.clearPad}
            onToggleMark={() => toggleMark(lessonId, write.index)}
            onPrev={write.prev}
            onNext={write.next}
            onRandom={write.random}
          />
        )}

        {tab === 'flash' && (
          <FlashcardTab
            key={lessonId}
            words={words}
            lessonMarks={lessonMarks}
            onToggleMark={(i) => toggleMark(lessonId, i)}
            onPracticeWord={goPractice}
          />
        )}

        {tab === 'quiz' && (
          <QuizTab
            key={lessonId}
            words={words}
            lessonId={lessonId}
            onWrong={onQuizWrong}
            onScoreChange={onScoreChange}
          />
        )}

        {tab === 'list' && (
          <VocabListTab words={words} onPractice={goPractice} />
        )}

        <section className="panel">
          <h2 className="section-title">Tiến độ của bài đang chọn</h2>
          <div className="stats">
            <div className="stat">
              <b>{words.length}</b>
              <span className="muted">Từ / mục từ</span>
            </div>
            <div className="stat">
              <b>{lessonMarks.size}</b>
              <span className="muted">Từ cần ôn</span>
            </div>
            <div className="stat">
              <b>{quizScore.score}/{quizScore.answered}</b>
              <span className="muted">Điểm trắc nghiệm</span>
            </div>
          </div>
          <div className="actions">
            <button
              type="button"
              onClick={() => {
                if (!lessonMarks.size) {
                  alert('Chưa có từ nào được đánh dấu.');
                  return;
                }
                goPractice([...lessonMarks][0]);
              }}
            >
              Ôn từ đã đánh dấu
            </button>
            <button type="button" onClick={() => clearLessonMarks(lessonId)}>
              Bỏ đánh dấu của bài này
            </button>
          </div>
        </section>
      </main>
      <footer>React + Vite · Chạy offline sau khi build · Đánh dấu lưu trên trình duyệt</footer>
    </>
  );
}
