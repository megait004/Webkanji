import { useMemo, useState } from 'react';

export function VocabListTab({ words, onPractice }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words.map((w, i) => ({ w, i }));
    return words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => w.join(' ').toLowerCase().includes(q));
  }, [words, query]);

  return (
    <section className="panel">
      <div className="row between">
        <h2 className="section-title">Từ vựng bài đang chọn</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm từ / nghĩa..."
        />
      </div>
      <p className="muted small">Bấm “Luyện từ này” hoặc “Thẻ bài” để ôn riêng từ đó.</p>
      <div className="list">
        {filtered.map(({ w, i }) => (
          <div key={`${w[1]}-${i}`} className="vocab">
            <span className="tag">{w[3]}</span>
            <div className="kanji">{w[1]}</div>
            <div><b>{w[0]}</b> · {w[2]}</div>
            <div className="small vocab-example">{w[4]}</div>
            <button type="button" onClick={() => onPractice(i)}>✍️ Luyện từ này</button>
          </div>
        ))}
      </div>
    </section>
  );
}
