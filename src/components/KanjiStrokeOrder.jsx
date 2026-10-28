import HanziWriter from 'hanzi-writer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { extractKanjiChars } from '../utils/extractKanji';
import { hasStrokeData, kanjiCharDataLoader } from '../utils/kanjiStrokeData';

const WRITER_OPTS = {
  width: 200,
  height: 200,
  padding: 12,
  showOutline: true,
  strokeAnimationSpeed: 1.2,
  delayBetweenStrokes: 400,
  strokeColor: '#242842',
  outlineColor: '#cbd0df',
  drawingColor: '#5555c9',
  charDataLoader: kanjiCharDataLoader,
};

export function KanjiStrokeOrder({ text, compact = false, autoPlay = true }) {
  const chars = useMemo(() => extractKanjiChars(text || ''), [text]);
  const supported = useMemo(() => chars.filter(hasStrokeData), [chars]);
  const [charIndex, setCharIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [strokeCount, setStrokeCount] = useState(0);
  const [strokeStep, setStrokeStep] = useState(0);
  const containerRef = useRef(null);
  const writerRef = useRef(null);

  const activeChar = supported[charIndex] ?? supported[0];

  useEffect(() => {
    setCharIndex(0);
    setStrokeStep(0);
  }, [text]);

  const destroyWriter = useCallback(() => {
    writerRef.current?.destroy?.();
    writerRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = '';
  }, []);

  const playAll = useCallback(() => {
    writerRef.current?.animateCharacter?.();
  }, []);

  const playOneStroke = useCallback((num) => {
    if (!writerRef.current) return;
    writerRef.current.animateStroke(num);
    setStrokeStep(num + 1);
  }, []);

  useEffect(() => {
    if (!activeChar || !containerRef.current) {
      setStatus(chars.length ? 'error' : 'idle');
      return undefined;
    }

    destroyWriter();
    setStatus('loading');
    setStrokeStep(0);

    let cancelled = false;
    const el = containerRef.current;

    const writer = HanziWriter.create(el, activeChar, {
      ...WRITER_OPTS,
      width: compact ? 160 : WRITER_OPTS.width,
      height: compact ? 160 : WRITER_OPTS.height,
      onLoadCharDataSuccess: (data) => {
        if (cancelled) return;
        setStrokeCount(data.strokes?.length ?? 0);
        setStatus('ready');
        if (autoPlay) writer.animateCharacter();
      },
      onLoadCharDataError: () => {
        if (cancelled) return;
        setStatus('error');
      },
    });

    writerRef.current = writer;

    return () => {
      cancelled = true;
      destroyWriter();
    };
  }, [activeChar, compact, autoPlay, destroyWriter, chars.length]);

  if (!chars.length) {
    return (
      <div className="stroke-panel stroke-panel--empty">
        <p className="muted small">Mục này không có chữ Kanji để xem nét viết.</p>
      </div>
    );
  }

  if (!supported.length) {
    return (
      <div className="stroke-panel stroke-panel--empty">
        <p className="muted small">Chưa có dữ liệu thứ tự nét cho: {chars.join(' ')}</p>
      </div>
    );
  }

  return (
    <div className={`stroke-panel ${compact ? 'stroke-panel--compact' : ''}`}>
      <div className="row between stroke-head">
        <div>
          <b>{compact ? 'Nét viết' : 'Thứ tự nét (書き順)'}</b>
          {!compact && (
            <p className="muted small" style={{ margin: '4px 0 0' }}>
              Xem từng nét rồi luyện viết ở ô bên dưới
            </p>
          )}
        </div>
        {supported.length > 1 && (
          <div className="stroke-char-tabs">
            {supported.map((ch, i) => (
              <button
                key={ch}
                type="button"
                className={i === charIndex ? 'active' : ''}
                onClick={() => setCharIndex(i)}
              >
                {ch}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="stroke-body">
        <div className="stroke-canvas-wrap">
          <div ref={containerRef} className="stroke-canvas" aria-label={`Nét viết ${activeChar}`} />
          {status === 'loading' && <span className="stroke-overlay muted small">Đang tải nét…</span>}
        </div>

        <div className="stroke-meta">
          <span className="tag">Chữ: {activeChar}</span>
          {strokeCount > 0 && (
            <span className="muted small">{strokeCount} nét</span>
          )}
          <div className="actions stroke-actions">
            <button type="button" className="primary" onClick={playAll} disabled={status !== 'ready'}>
              ▶ Phát lại
            </button>
            <button
              type="button"
              onClick={() => playOneStroke(strokeStep >= strokeCount ? 0 : strokeStep)}
              disabled={status !== 'ready' || !strokeCount}
            >
              Nét tiếp ({strokeStep >= strokeCount ? 1 : strokeStep + 1}/{strokeCount || '–'})
            </button>
            <button
              type="button"
              onClick={() => {
                setStrokeStep(0);
                writerRef.current?.showOutline?.();
                writerRef.current?.showCharacter?.();
              }}
              disabled={status !== 'ready'}
            >
              Hiện khung
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
