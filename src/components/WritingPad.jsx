import { useCallback, useEffect, useRef } from 'react';

export function WritingPad({ clearToken }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    c.width = r.width * d;
    c.height = r.height * d;
    const ctx = c.getContext('2d');
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#242842';
  }, []);

  const clear = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    clear();
  }, [clearToken, clear]);

  const point = (e, c) => {
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e) => {
    const c = canvasRef.current;
    if (!c) return;
    drawingRef.current = true;
    c.setPointerCapture(e.pointerId);
    const ctx = c.getContext('2d');
    const p = point(e, c);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const p = point(e, c);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="writing-pad"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onLostPointerCapture={stopDrawing}
    />
  );
}

export function clearPadRef() {
  return Date.now();
}
