// src/components/AttendeeSelector.jsx
import styled from "styled-components";
import { useAllProfiles } from "../utils/useAllProfiles";

const Section = styled.div`
  margin-top: 32px;
`;

const Label = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--Text-sub);
  margin-bottom: 8px;
`;

const List = styled.div`
  max-height: 160px;
  overflow-y: auto;
  border-radius: 12px;
  background-color: var(--background-lower);
  padding: 8px 10px;
  box-sizing: border-box;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 8px;
  cursor: pointer;

  &:active {
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const Checkbox = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1px solid var(--Text-sub);
  background-color: ${({ $checked }) =>
    $checked ? "var(--Text-main)" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: ${({ $checked }) =>
    $checked ? "var(--background-elevate)" : "transparent"};
`;

const Name = styled.div`
  font-size: 13px;
  color: var(--Text-main);
`;

const Meta = styled.div`
  font-size: 11px;
  color: var(--Text-sub);
`;

export default function AttendeeSelector({ selectedIds, onChange }) {
  const { profiles, loading } = useAllProfiles();

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <Section>
      <Label>참석자</Label>
      {loading ? (
        <div style={{ fontSize: 12, color: "var(--Text-sub)" }}>
          참석자 목록을 불러오는 중...
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--Text-sub)" }}>
          아직 등록된 사용자가 없습니다.
        </div>
      ) : (
        <List>
          {profiles.map((p) => {
            const checked = selectedIds.includes(p.id);
            return (
              <Row key={p.id} onClick={() => toggle(p.id)}>
                <Checkbox $checked={checked}>{checked ? "✓" : ""}</Checkbox>
                <div>
                  <Name>{p.name ?? "이름 없음"}</Name>
                  <Meta>
                    {p.department ?? "부서 없음"} · {p.role ?? "역할 없음"}
                  </Meta>
                </div>
              </Row>
            );
          })}
        </List>
      )}
    </Section>
  );
}
