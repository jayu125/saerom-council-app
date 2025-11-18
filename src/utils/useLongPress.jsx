// src/utils/useLongPress.js
import { useRef, useCallback } from "react";

export default function useLongPress(
  callback,
  delay = 500,
  moveThreshold = 10
) {
  const timerRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const start = useCallback(
    (e) => {
      moved.current = false;
      const touch = e.touches ? e.touches[0] : e;
      startPos.current = { x: touch.clientX, y: touch.clientY };

      // 타이머 시작
      timerRef.current = setTimeout(() => {
        if (!moved.current) {
          callback();
        }
      }, delay);
    },
    [callback, delay]
  );

  const move = useCallback(
    (e) => {
      if (!timerRef.current) return;
      const touch = e.touches ? e.touches[0] : e;
      const dx = Math.abs(touch.clientX - startPos.current.x);
      const dy = Math.abs(touch.clientY - startPos.current.y);

      // 스크롤 또는 손가락 이동이 일정 거리 이상이면 롱프레스 취소
      if (dx > moveThreshold || dy > moveThreshold) {
        moved.current = true;
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    [moveThreshold]
  );

  const clear = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchMove: move, // 👈 이동 감지 추가
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}
