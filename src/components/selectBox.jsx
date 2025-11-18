import { useEffect, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  row-gap: 10px;
`;

const BoxWrap = styled.div`
  min-width: 90px;
  height: 40px;
  border: 2px solid var(--background-lower);
  background-color: ${({ isselected }) =>
    isselected == "true" ? "var(--background)" : "var(--background-btn);"};
  color: ${({ isselected }) =>
    isselected == "true" ? "var(--Text-main)" : "var(--Text-sub);"};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  padding: 2px 30px;
  box-sizing: border-box;
  align-content: center;
  &:active {
    transition: all 0.2s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const ManualInputFiled = styled.input`
  min-width: 90px;
  max-width: 120px;
  height: 40px;
  border: 2px solid var(--background-lower);
  background-color: ${({ isselected }) =>
    isselected == "true" ? "var(--background)" : "var(--background-btn);"};
  color: var(--Text-main);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  padding: 2px 30px;
  box-sizing: border-box;
  &:active {
    transition: all 0.2s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

export function SelectBox({ title, state, setState }) {
  return (
    <BoxWrap
      isselected={state == title ? "true" : "false"}
      onClick={() => {
        if (state !== title) {
          setState(title);
        } else {
          setState(null);
        }
      }}
    >
      {title}
    </BoxWrap>
  );
}

export function SelectManual({ state, setState }) {
  const [inputValue, setInputValue] = useState("");
  const onchange = (e) => {
    setInputValue(e.target.value);
  };
  useEffect(() => {
    if (inputValue === "") {
      setState(null);
    } else {
      setState(inputValue);
    }
  }, [inputValue]);
  return (
    <ManualInputFiled
      placeholder="직접 입력"
      onChange={onchange}
      value={inputValue}
      isselected={state == inputValue ? "true" : "false"}
      onClick={() => {
        if (inputValue !== "") {
          setState(inputValue);
        }
      }}
    ></ManualInputFiled>
  );
}

export default function Selection({ arr, state, setState }) {
  return (
    <Wrapper>
      {arr.map((el, idx) => (
        <SelectBox key={idx} state={state} setState={setState} title={el} />
      ))}
      <SelectManual state={state} setState={setState} />
    </Wrapper>
  );
}
