import styled from "styled-components";
import Modal, { useModal } from "../components/modal";
import { useEffect } from "react";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default function TestPage() {
  const modalContext = useModal();
  useEffect(() => {
    modalContext[1](true);
  }, []);
  return <Wrapper>{modalContext[0] ? <Modal height={600} /> : null}</Wrapper>;
}
