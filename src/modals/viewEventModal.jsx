// modals/viewEventModal.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useModal } from "../components/modal";
import { supabase } from "../supabaseClient";
import { OrbitProgress } from "react-loading-indicators";
import { useMemo } from "react";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 10px;
  padding-bottom: 20px;
  box-sizing: border-box;
  position: relative;
  border-top: 1px dashed var(--Text-sub);
  user-select: none;
`;

const Scrollable = styled.div`
  overflow-y: scroll;
  width: 100%;
  height: 100%;
`;

const FadeOverlay = styled.div`
  width: 100%;
  height: 60px;
  position: absolute;
  transform: translate(-50%, 0px);
  left: 50%;
  bottom: 18px;
  background: linear-gradient(
    to top,
    var(--background-elevate),
    rgba(0, 0, 255, 0),
    rgba(0, 0, 255, 0)
  );
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;
const Item = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  box-sizing: border-box;
  padding: 10px 0px;
  border-radius: 10px;
  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-lower);
  }
`;

const LeftBox = styled.div`
  width: 60px;
  position: relative;
`;

const MidBox = styled.div`
  width: 18px;
  position: relative;
`;

const RightBox = styled.div`
  width: 100%;
  position: relative;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--Text-main);
  top: 1px;
  position: absolute;
`;

const Meta = styled.div`
  font-size: 10px;
  color: var(--Text-sub);
  position: absolute;
  top: 22px;
`;

const Time = styled.div`
  font-size: 12px;
  color: var(--Text-main);
  font-weight: 600;
  position: absolute;
  top: 3px;
  left: 5px;
`;

const ColorMeta = styled.div`
  width: 4px;
  height: 50%;
  position: absolute;
  top: 0;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`;

const DetailWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
  background-color: var(--background-elevate);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
`;

const DeleteButton = styled.div`
  width: 250px;
  height: 55px;
  border-radius: 15px;
  background-color: tomato;
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const CheckModal = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  gap: 4px;
`;

const ButtonArea = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.div`
  width: 100px;
  height: 55px;
  border-radius: 15px;
  background-color: var(--background-lower);
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;
const CheckBtton = styled.div`
  width: 100px;
  height: 55px;
  border-radius: 15px;
  background-color: tomato;
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  &:active {
    transition: all 0.15s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const LoadingArea = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(0.5);
`;

export default function ViewEventModalChild({
  setter,
  setSelectedEventId,
  date,
  events = [],
  selectedEventId,
}) {
  const [eventIdForEdit, setEventIdForEdit] = useState(null);

  const onItemCLick = (ev) => {
    if (eventIdForEdit === ev.id) {
      setter(false);
      setEventIdForEdit(null);
      setSelectedEventId(null);
    } else {
      setter(true);
      setEventIdForEdit(ev.id);
      setSelectedEventId(ev.id);
    }
  };

  if (!date) return null;
  return (
    <>
      <Wrapper>
        <Scrollable>
          <List>
            {events.length === 0 && <Meta>일정이 없습니다.</Meta>}
            {events.map((ev) => {
              const d = new Date(ev.starts_at);
              const hh = String(d.getHours()).padStart(2, "0");
              const mm = String(d.getMinutes()).padStart(2, "0");
              const isSelected = ev.id === selectedEventId;
              return (
                <Item
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--background-lower)",
                          transform: "var(--active-transform)",
                        }
                      : undefined
                  }
                  onClick={() => onItemCLick(ev)}
                  key={ev.id}
                >
                  <LeftBox>
                    <Time>
                      {hh}:{mm}
                    </Time>
                  </LeftBox>
                  <MidBox>
                    <ColorMeta $color={ev.color}></ColorMeta>
                  </MidBox>
                  <RightBox>
                    <Title>{ev.title}</Title>
                    <Meta>
                      {ev.location ?? "장소 없음"} •{" "}
                      {ev.description ?? "설명 없음"}
                    </Meta>
                  </RightBox>
                </Item>
              );
            })}
          </List>
        </Scrollable>
        <FadeOverlay></FadeOverlay>
      </Wrapper>
    </>
  );
}

export function EventDetailModalChild({
  setter, // setExpendModalOpen (확장 모달 열고/닫는 용도)
  selectedEventId, // 🔹 Modal에서 내려주는 현재 선택된 이벤트 id
  events = [], // 🔹 같은 날의 이벤트 목록 (필요 시 제목/설명 표시용)
}) {
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const { closeModal } = useModal();

  // 🔹 선택된 이벤트 객체 (UI에 제목/설명 보여줄 때 사용 가능)
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  // 🔹 권한 체크: 현재 유저 == 이벤트 생성자(user_id) 인지
  useEffect(() => {
    if (!selectedEventId) {
      setCanDelete(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          if (!cancelled) setCanDelete(false);
          return;
        }
        const userId = userData.user.id;

        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("user_id")
          .eq("id", selectedEventId)
          .single();

        if (eventError || !eventData) {
          if (!cancelled) setCanDelete(false);
          return;
        }

        if (!cancelled) {
          setCanDelete(eventData.user_id === userId);
        }
      } catch (err) {
        console.log("EventDetailModalChild 권한 확인 중 에러 발생 : ", err);
        if (!cancelled) setCanDelete(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  const onDeleteClick = async () => {
    if (!selectedEventId) {
      console.warn("삭제할 이벤트 id가 없습니다.");
      return;
    }
    if (!canDelete) {
      console.warn("삭제 권한이 없습니다.");
      return;
    }

    try {
      setIsLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) throw userError;
      const user = userData.user;

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", selectedEventId)
        .eq("user_id", user.id); // 🔐 서버에서 한 번 더 권한 체크

      if (error) throw error;
    } catch (err) {
      console.log(
        "EventDetailModalChild 의 onDeleteClick에서 에러 발생 : ",
        err
      );
    } finally {
      setIsLoading(false);
      setter(false); // 확장 모달 닫기
      closeModal(); // 전체 모달 닫기
    }
  };

  // 🔹 선택된 이벤트 자체가 없는 경우
  if (!selectedEventId) {
    return (
      <DetailWrapper>
        <CheckModal>
          <div>선택된 일정이 없습니다.</div>
        </CheckModal>
      </DetailWrapper>
    );
  }

  return (
    <DetailWrapper>
      {!canDelete ? (
        <CheckModal>
          <div>수정은 공사중!</div>
          <div>삭제 권한이 없습니다</div>
        </CheckModal>
      ) : checkModalOpen ? (
        <CheckModal>
          <div>정말 삭제?</div>

          <ButtonArea>
            <CancelButton onClick={() => setCheckModalOpen(false)}>
              취소
            </CancelButton>
            <CheckBtton onClick={onDeleteClick}>
              {isLoading ? (
                <LoadingArea>
                  <OrbitProgress
                    dense
                    color="#ffffff"
                    size="small"
                    text=""
                    textColor=""
                  />
                </LoadingArea>
              ) : (
                "삭제"
              )}
            </CheckBtton>
          </ButtonArea>
          {selectedEvent && (
            <div
              style={{
                marginTop: "20px",
                fontSize: "24px",
                color: "var(--Text-sub)",
                marginBottom: "4px",
                borderBottom: "2px solid var(--Text-sub)",
              }}
            >
              {selectedEvent.title}
            </div>
          )}
        </CheckModal>
      ) : (
        <>
          <div>수정은 공사중!</div>

          <DeleteButton onClick={() => setCheckModalOpen(true)}>
            일정 삭제
          </DeleteButton>
          {selectedEvent && (
            <div
              style={{
                marginTop: "20px",
                fontSize: "24px",
                color: "var(--Text-sub)",
                marginBottom: "4px",
                borderBottom: "2px solid var(--Text-sub)",
              }}
            >
              {selectedEvent.title}
            </div>
          )}
        </>
      )}
    </DetailWrapper>
  );
}
