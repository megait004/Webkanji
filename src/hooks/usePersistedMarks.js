import { useCallback, useEffect, useState } from 'react';
import { LESSON_IDS } from '../data/lessons';

const STORAGE_KEY = 'webkanji-marks-v1';

function loadMarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMarks();
    const parsed = JSON.parse(raw);
    const out = emptyMarks();
    for (const id of LESSON_IDS) {
      if (Array.isArray(parsed[id])) out[id] = new Set(parsed[id]);
    }
    return out;
  } catch {
    return emptyMarks();
  }
}

function emptyMarks() {
  return Object.fromEntries(LESSON_IDS.map((id) => [id, new Set()]));
}

function saveMarks(marks) {
  const serializable = Object.fromEntries(
    LESSON_IDS.map((id) => [id, [...(marks[id] || [])]]),
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function usePersistedMarks() {
  const [marks, setMarks] = useState(loadMarks);

  useEffect(() => {
    saveMarks(marks);
  }, [marks]);

  const toggleMark = useCallback((lessonId, index) => {
    setMarks((prev) => {
      const next = { ...prev, [lessonId]: new Set(prev[lessonId]) };
      if (next[lessonId].has(index)) next[lessonId].delete(index);
      else next[lessonId].add(index);
      return next;
    });
  }, []);

  const clearLessonMarks = useCallback((lessonId) => {
    setMarks((prev) => ({ ...prev, [lessonId]: new Set() }));
  }, []);

  return { marks, toggleMark, clearLessonMarks };
}
