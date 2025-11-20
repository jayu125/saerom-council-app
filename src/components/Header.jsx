import styled from "styled-components";
import { usePage } from "../pageProvider";
import { useCalendarYM } from "../utils/calendarHeaderBus";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const Wrapper = styled.div`
  width: 100%;
  height: 120px;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ContentBox = styled.div`
  width: 100%;
  padding: 0px 30px;
  display: flex;
  justify-content: left;
`;

const Text = styled.p`
  color: var(--Text-main);
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1; /* 라인 높이 고정: 흔들림 방지 */
  letter-spacing: 2px;
`;

/* 한 줄만 보이게 마스킹 */
const Roller = styled.span`
  position: relative;
  display: inline-block;
  height: 1.1em;
  overflow: hidden;
  vertical-align: bottom;
`;

/* 실제로 translate3d를 적용할 트랙 */
const Track = styled.span`
  display: inline-flex;
  flex-direction: column;
  will-change: transform;
`;

/**
 * 슬롯머신 스타일 연속 롤링 (RAF 기반)
 * - 빠르게 값이 바뀌면 무한 롤링만 유지 (끊김 X)
 * - 입력이 멈추면 감속하며 최종 값 라인에 스냅
 */
function SlotRollingText({
  value,
  debounce = 20, // 입력이 없다고 판단하는 시간 (ms)
  speedPxPerSec = 500, // 기본 롤링 속도 (px/s)
  decelPxPerSec2 = 2500, // 감속도 (px/s^2) — 멈출 때 관성 느낌
  columns = 4, // 트랙에 렌더할 줄 개수 (같은 텍스트 반복)
}) {
  const trackRef = useRef(null);
  const probeRef = useRef(null);

  // 줄 높이/오프셋/속도는 ref로 (렌더 최소화)
  const lineHRef = useRef(0);
  const offsetRef = useRef(0); // 현재 translateY (양수 증가 시 위로 올라가므로 아래로 내려가게 음수 사용)
  const speedRef = useRef(0); // px/s (양수면 아래로 굴러가는 효과)
  const runningRef = useRef(false);
  const settleTargetRef = useRef(null); // 정착 모드 활성화 시 목표 오프셋
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const debounceTimerRef = useRef(null);

  const [curr, setCurr] = useState(value);
  const [items, setItems] = useState(() =>
    Array.from({ length: columns }, () => value)
  );

  // 줄 높이 측정 (초기 1회)
  useLayoutEffect(() => {
    if (!probeRef.current) return;
    const r = probeRef.current.getBoundingClientRect();
    lineHRef.current = r.height || 0;
    // 초깃값 표시를 위해 한번 위치 맞춰주기
    offsetRef.current = 0;
    applyTransform();
  }, []);

  // value 변경 → 롤링 시작(or 유지) + 디바운스 후 정착
  useEffect(() => {
    if (value !== curr) {
      setCurr(value);
      // 트랙 내용은 동일 텍스트 반복 (시각적 슬롯 효과 충분)
      setItems(Array.from({ length: columns }, () => value));

      // 롤링 시작/유지
      startSpin();

      // 디바운스: 입력이 끊기면 그 때 감속-정착
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        beginSettleTo(value);
      }, debounce);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function startSpin() {
    if (!runningRef.current) {
      runningRef.current = true;
      speedRef.current = speedPxPerSec;
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // 이미 돌고 있으면 속도만 보정 (갑자기 느려진 상태에서 다시 빨라지도록)
      speedRef.current = speedPxPerSec;
      // 정착 예정이었으면 취소
      settleTargetRef.current = null;
    }
  }

  function beginSettleTo(finalText) {
    // 현재 회전 상태에서 감속 시작 → 가장 가까운 줄 경계에 스냅
    // items는 이미 finalText로 채워져 있으니, 딱 줄 경계에만 멈추면 됨
    if (!runningRef.current) return; // 아직 라인높이 미측정 등
    settleTargetRef.current = "snap"; // 스냅 모드 플래그
  }

  function stopSpin() {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    speedRef.current = 0;
    settleTargetRef.current = null;
  }

  function applyTransform() {
    if (!trackRef.current) return;
    // offsetRef.current는 누적 px, 트랙 높이를 넘으면 모듈러로 감싸서 무한 루프
    const lineH = lineHRef.current || 1;
    const totalH = Math.max(lineH * items.length, 1);
    let y = offsetRef.current % totalH;
    if (y < 0) y += totalH; // 항상 [0,totalH) 범위
    // 위로 올라가는 방향이 자연스러우면 -y로 (아래로 떨어지는 느낌은 +y로)
    trackRef.current.style.transform = `translate3d(0, -${y}px, 0)`;
  }

  function tick(ts) {
    if (!runningRef.current) return;
    const lineH = lineHRef.current || 0;
    if (!lineH) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (!lastTsRef.current) lastTsRef.current = ts;
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05); // 최대 50ms step로 클램프
    lastTsRef.current = ts;

    // 1) 기본 회전 (직선 속도)
    offsetRef.current += speedRef.current * dt;

    // 2) 정착 모드라면 감속 → 스냅
    if (settleTargetRef.current) {
      // 속도 줄이기
      const v = speedRef.current;
      const newV = Math.max(v - decelPxPerSec2 * dt, 120); // 너무 느려지면 비자연스러우니 최소 속도 유지
      speedRef.current = newV;

      // 충분히 느려졌으면 딱 맞춰 스냅하고 종료
      if (newV <= 140) {
        // 현재 오프셋을 가장 가까운 줄 경계(= lineH의 배수)에 맞추기
        const totalH = lineH * items.length;
        let y = offsetRef.current % totalH;
        if (y < 0) y += totalH;
        const k = Math.round(y / lineH); // 가장 가까운 라인 인덱스
        const targetY = k * lineH;

        // 부드럽게 마지막 보정 (짧은 시간)
        // rAF 100~160ms 정도로 선형 보정
        const remain = targetY - y;
        const settleStart = performance.now();
        const settleDur = 140;

        const settleStep = (now) => {
          const t = Math.min((now - settleStart) / settleDur, 1);
          const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1; // cubic-out
          const cur = y + remain * ease;
          offsetRef.current =
            Math.floor(offsetRef.current / totalH) * totalH + cur;
          applyTransform();

          if (t < 1) {
            rafRef.current = requestAnimationFrame(settleStep);
          } else {
            stopSpin(); // 완전 종료
          }
        };

        // 스냅 단계로 진입: 메인 루프 잠시 종료하고 보정 시작
        runningRef.current = false;
        rafRef.current = requestAnimationFrame(settleStep);
        return;
      }
    }

    // 적용
    applyTransform();
    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <Roller aria-label={curr}>
      {/* 줄 높이 측정을 위한 프로브 (숨김) */}
      <span
        ref={probeRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {curr}
      </span>

      {/* 같은 텍스트를 여러 줄 반복하여 슬롯 효과 */}
      <Track ref={trackRef}>
        {items.map((txt, i) => (
          <span key={`${i}-${txt}`} style={{ whiteSpace: "nowrap" }}>
            {txt}
          </span>
        ))}
      </Track>
    </Roller>
  );
}

export default function Header() {
  const pageContext = usePage();
  const { year, month } = useCalendarYM(); // 기본값: 오늘
  const isCalendar = pageContext[0] === "캘린더";
  const calendarText =
    year && month ? `${year}년 ${month}월 (${month}월)` : "캘린더";

  return (
    <Wrapper>
      <ContentBox>
        {isCalendar ? (
          <Text>
            <SlotRollingText value={`${year}년`} />
            &nbsp;
            <SlotRollingText value={`${month}월`} />
          </Text>
        ) : pageContext[0] === "부서" ? (
          <Text>부서</Text>
        ) : pageContext[0] === "회의" ? (
          <Text>회의</Text>
        ) : (
          <Text>My</Text>
        )}
      </ContentBox>
    </Wrapper>
  );
}
