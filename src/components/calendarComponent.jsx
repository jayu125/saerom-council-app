import styled from "styled-components";
import { VariableSizeList as List } from "react-window";
import { useEffect, useRef, useState } from "react";
import Day from "./calendarDay";
import { publishCalendarYM } from "../utils/calendarHeaderBus";
import { useMonthEvents } from "../utils/useMonthEvent";
import { down, up } from "../styles/media";
import { theme } from "../theme";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const DayWrap = styled.div`
  height: 110px;
`;

const DayIndicator = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  box-shadow: 0px 2px 1px 1px rgba(0, 0, 0, 0);
`;

const IndiChild = styled.div`
  color: ${({ color }) => color};
  font-size: 10px;
  font-weight: 500;
  display: flex;
  justify-content: ${({ device }) => (device == "phone" ? "flex" : "right")};
  align-items: center;
  background-color: var(--background-elevate);
  padding: 8px 0px;
`;

const Scrollable = styled.div`
  position: absolute;
  bottom: 0;
  width: ${({ isstatic }) => (isstatic == "t" ? "100%" : null)};
  height: ${({ isstatic, h }) => (isstatic == "t" ? `${h}px` : null)};
  overflow-y: ${({ isstatic }) => (isstatic == "t" ? "scroll" : null)};
  overscroll-behavior: contain;
`;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  color: white;
  box-sizing: border-box;
  border-bottom: 2px solid var(--background-elevate);
  height: ${({ h }) => `${h}px`};

  & > *:first-child,
  & > *:last-child {
    color: var(--Text-sub);
  }
`;

/* ───────────── 달력 유틸 ───────────── */
const daysInMonth = (year, month) => new Date(year, month, 0).getDate(); // month: 1~12
const firstWeekdayOfMonth = (year, month) =>
  new Date(year, month - 1, 1).getDay(); // 0:Sun~6:Sat

const buildMonthRows = (year, month, dividerHeight = 60) => {
  const rows = [];

  // divider: 1일의 요일 위치에 "{month}월" 라벨
  const first = firstWeekdayOfMonth(year, month);
  const dividerChild = Array(7).fill(null);
  dividerChild[first] = { label: `${month}월` };
  rows.push({
    id: `${year}-${month}-divider`,
    type: "divider",
    ownerYear: year,
    ownerMonth: month,
    height: dividerHeight,
    child: dividerChild,
  });

  const dim = daysInMonth(year, month);
  let day = 1;

  // 첫 주
  {
    const week = Array(7).fill(null);
    for (let i = first; i < 7 && day <= dim; i++) {
      week[i] = { year, month, dayId: day++ };
    }
    rows.push({
      id: `${year}-${month}-w1`,
      type: "week",
      ownerYear: year,
      ownerMonth: month,
      height: 120,
      child: week,
    });
  }

  // 나머지 주
  let w = 2;
  while (day <= dim) {
    const week = Array(7).fill(null);
    for (let i = 0; i < 7 && day <= dim; i++) {
      week[i] = { year, month, dayId: day++ };
    }
    rows.push({
      id: `${year}-${month}-w${w++}`,
      type: "week",
      ownerYear: year,
      ownerMonth: month,
      height: 120,
      child: week,
    });
  }

  return rows;
};

const generateCalendarRows = ({
  startYear = 2025,
  startMonth = 1,
  months = 240,
  dividerHeight = 60,
  weekHeight = 120,
}) => {
  const all = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < months; i++) {
    all.push(...buildMonthRows(y, m, dividerHeight, weekHeight));
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return all;
};

/* ── 초기: 이번 달만 정적 DOM ── */
function StaticMonth({ year, month, todayMarkClass, scrollAreaObj }) {
  const rows = buildMonthRows(year, month, 60, 120);
  const now = new Date();
  const TY = now.getFullYear();
  const TM = now.getMonth() + 1;
  const TD = now.getDate();

  return (
    <>
      {rows.map((row) => (
        <Row
          key={row.id}
          h={scrollAreaObj.w < theme.bp.md ? row.height : row.height * 1.5}
          data-divider={row.type === "divider" ? "true" : "false"}
          data-year={row.ownerYear}
          data-month={row.ownerMonth}
        >
          {Array.from({ length: 7 }).map((_, col) => {
            const cell = row.child[col] ?? null;
            const isToday =
              !!cell &&
              cell.year === TY &&
              cell.month === TM &&
              cell.dayId === TD;

            return (
              <Day
                key={`${row.id}-${col}`}
                dayN={cell}
                className={isToday ? todayMarkClass : undefined}
                data-today={isToday ? "true" : undefined}
                w={scrollAreaObj.w / 7}
              />
            );
          })}
        </Row>
      ))}
    </>
  );
}

const CalendarRow = ({ index, style, data }) => {
  const { calendarRows, byDate, TODAY, width } = data;
  const row = calendarRows[index];
  const child = row.child ?? [];

  return (
    <Row
      h={row.height}
      style={style}
      data-divider={row.type === "divider" ? "true" : "false"}
      data-year={row.ownerYear}
      data-month={row.ownerMonth}
    >
      {Array.from({ length: 7 }).map((_, col) => {
        const cell = child[col] ?? null;
        const isToday =
          !!cell &&
          cell.year === TODAY.y &&
          cell.month === TODAY.m &&
          cell.dayId === TODAY.d;

        const eventsForCell = cell
          ? byDate.get(`${cell.year}-${cell.month}-${cell.dayId}`) ?? []
          : [];

        return (
          <Day
            key={`${index}-${col}`}
            device={width < theme.bp.md ? "phone" : "tablet"}
            dayN={cell}
            className={isToday ? "is-today" : undefined}
            data-today={isToday ? "true" : undefined}
            events={eventsForCell}
          />
        );
      })}
    </Row>
  );
};

export default function Calendar() {
  const WrapperRef = useRef(null);
  const IndiRef = useRef(null);
  const listRef = useRef(null);
  const staticScrollRef = useRef(null); // ★ static 컨테이너 ref

  const [scrollAreaObj, setScrollAreaObj] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState("static"); // 'static' | 'virtual'
  const [calendarRows, setCalendarRows] = useState([]);

  const today = new Date();
  const TODAY = {
    y: today.getFullYear(),
    m: today.getMonth() + 1,
    d: today.getDate(),
  };

  // +---------------------------------------------------------------------------
  const [visibleYM, setVisibleYM] = useState({ y: TODAY.y, m: TODAY.m });
  const { byDate } = useMonthEvents(visibleYM.y, visibleYM.m);
  // +---------------------------------------------------------------------------

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  function handleResize() {
    const offsetHeight = WrapperRef.current.offsetHeight;
    const offsetWidth = WrapperRef.current.offsetWidth;
    setScrollAreaObj({
      w: offsetWidth,
      h: offsetHeight - (IndiRef.current?.offsetHeight ?? 0),
    });
  }

  // 헤더 기본값을 현재 달로
  useEffect(() => {
    publishCalendarYM(TODAY.y, TODAY.m);
  }, []); // eslint-disable-line

  // 사이즈 측정
  useEffect(() => {
    if (!WrapperRef.current) return;
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (phase !== "static" || !staticScrollRef.current) return;
    const rows = buildMonthRows(TODAY.y, TODAY.m, 60, 120);
    let offset = 0;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.type === "week") {
        const hasToday = (r.child ?? []).some(
          (c) =>
            c &&
            c.year === TODAY.y &&
            c.month === TODAY.m &&
            c.dayId === TODAY.d
        );
        if (hasToday) break;
      }
      offset += r.height;
    }

    staticScrollRef.current.scrollTop = offset;
  }, [phase, scrollAreaObj.h]);

  useEffect(() => {
    const makeAll = () => {
      const all = generateCalendarRows({
        startYear: 2025,
        startMonth: 1,
        months: 60,
        dividerHeight: 60,
        weekHeight: 120,
      });
      setCalendarRows(all);
      setPhase("virtual");
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(makeAll);
    } else {
      setTimeout(makeAll, 0);
    }
  }, []);

  function findRowIndexForToday(rows) {
    let weekIndex = -1;
    let dividerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.ownerYear === TODAY.y && r.ownerMonth === TODAY.m) {
        if (r.type === "divider" && dividerIndex === -1) dividerIndex = i;
        if (r.type === "week") {
          const hasToday = (r.child ?? []).some(
            (c) =>
              c &&
              c.year === TODAY.y &&
              c.month === TODAY.m &&
              c.dayId === TODAY.d
          );
          if (hasToday) {
            weekIndex = i;
            break;
          }
        }
      }
    }
    return weekIndex !== -1 ? weekIndex : dividerIndex;
  }

  useEffect(() => {
    if (phase !== "virtual" || !listRef.current || calendarRows.length === 0)
      return;
    const idx = findRowIndexForToday(calendarRows);
    if (idx != null && idx >= 0) {
      listRef.current.scrollToItem(idx, "start");
      const row = calendarRows[idx];
      if (row) {
        publishCalendarYM(row.ownerYear, row.ownerMonth);
        setVisibleYM({ y: row.ownerYear, m: row.ownerMonth });
      }
    }
  }, [phase]); // eslint-disable-line

  const lastYMRef = useRef(null);
  const handleItemsRendered = ({ visibleStartIndex, visibleStopIndex }) => {
    const mid = Math.floor((visibleStartIndex + visibleStopIndex) / 2);
    const row = calendarRows[mid];
    if (!row) return;
    const ymKey = `${row.ownerYear}-${row.ownerMonth}`;
    if (lastYMRef.current !== ymKey) {
      lastYMRef.current = ymKey;
      publishCalendarYM(row.ownerYear, row.ownerMonth);
      // +---------------------------------------------------------------------------
      setVisibleYM({ y: row.ownerYear, m: row.ownerMonth });
      // +---------------------------------------------------------------------------
    }
  };

  return (
    <Wrapper ref={WrapperRef}>
      <DayIndicator ref={IndiRef}>
        {days.map((el, index) => (
          <IndiChild
            device={scrollAreaObj.w < theme.bp.md ? "phone" : "tablet"}
            key={index}
            color={el === "S" ? "var(--Text-sub)" : "var(--Text-main)"}
          >
            {el}
          </IndiChild>
        ))}
      </DayIndicator>

      <Scrollable
        ref={phase === "static" ? staticScrollRef : undefined}
        isstatic={phase === "static" ? "t" : "f"}
        h={scrollAreaObj.h}
      >
        {phase === "static" ? (
          <>
            <StaticMonth
              year={TODAY.y}
              month={TODAY.m}
              todayMarkClass="is-today"
              scrollAreaObj={scrollAreaObj}
            />
            <StaticMonth
              year={TODAY.y}
              month={TODAY.m + 1}
              todayMarkClass="is-today"
              scrollAreaObj={scrollAreaObj}
            />
          </>
        ) : (
          <List
            ref={listRef}
            height={scrollAreaObj.h}
            itemCount={calendarRows.length}
            itemSize={(index) =>
              scrollAreaObj.w < theme.bp.md
                ? calendarRows[index]?.height ?? 100
                : calendarRows[index]?.height * 1.5 ?? 100
            }
            width={scrollAreaObj.w}
            itemKey={(index) => calendarRows[index]?.id ?? index}
            onItemsRendered={handleItemsRendered}
            overscanCount={4}
            // ✅ 여기 중요: 데이터 묶어서 전달
            itemData={{
              calendarRows,
              byDate,
              TODAY,
              width: scrollAreaObj.w,
            }}
          >
            {CalendarRow}
          </List>
        )}
      </Scrollable>
    </Wrapper>
  );
}
