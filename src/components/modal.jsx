import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";
import styled from "styled-components";

const BgOverlay = styled(motion.div)`
  width: 100%;
  height: 100%;
  background-color: #00000040;
  z-index: 997;
  position: fixed;
  backdrop-filter: blur(4px);
`;

const Wrapper = styled(motion.div)`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${({ width }) => width};
  height: ${({ height }) => `${height}px`};
  z-index: 1000;
  background-color: var(--background-elevate);
  border-radius: 25px;
  max-width: 400px;
  z-index: 999;
`;

const SvgIcon = styled.div`
  width: 32px;
  height: 32px;
`;

const Header = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 0px 30px;
  box-sizing: border-box;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: var(--Text-main);
`;

const Body = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  padding: 20px 30px 0px 30px;
  box-sizing: border-box;
  position: relative;
`;

const ExpendWrapper = styled(motion.div)`
  width: ${({ $modalsize }) => `${$modalsize.width}`};
  height: ${({ $modalsize }) => `${$modalsize.height}px`};
  max-width: 400px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--background-elevate);
  border-radius: 25px;
  z-index: 998;
`;

const ModalContext = createContext(null);

// function ModalProvider({ children }) {
//   const [modalObj, setModalObj] = useState({
//     isopen: false,
//     title: "제목",
//     child: <div></div>,
//   });
//   useEffect(() => {
//     console.log(modalObj);
//   }, [modalObj]);
//   return (
//     <ModalContext.Provider value={{ modalObj, setModalObj }}>
//       <AnimatePresence>
//         {modalObj.isopen && <Modal height={700} />}
//       </AnimatePresence>
//       {children}
//     </ModalContext.Provider>
//   );
// }

function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    child: null,
    childProps: {},
    expendChild: null,
  });
  const [windowInfo, setWindowInfo] = useState({ width: "400px", height: 650 });
  const [isVisible, setIsVisible] = useState(false);

  // 애니메이션 종료 시점에만 visible false로 변경
  const closeModal = () => {
    setIsOpen(false);
    setIsVisible(false);
  };

  const openModal = (content, windowinfo = { width: "400px", height: 650 }) => {
    setModalContent(content);
    setWindowInfo({ width: windowinfo.width, height: windowinfo.height });
    setIsVisible(true);
    setIsOpen(true);
    // requestAnimationFrame(() => setIsOpen(true)); // 애니메이션 자연스럽게
  };

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, modalContent, isOpen }}
    >
      <AnimatePresence>
        {isVisible && (
          <Modal
            width={windowInfo.width}
            height={windowInfo.height}
            isOpen={isOpen}
            onClose={closeModal}
            content={modalContent}
          />
        )}
      </AnimatePresence>
      {children}
    </ModalContext.Provider>
  );
}

export default function Modal({ width, height }) {
  // const modalContext = useModal();
  const { openModal, closeModal, modalContent } = useModal();
  const [expendModalOpen, setExpendModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const Child = modalContent.child || null;
  const ExpendChild = modalContent.expendChild || null;

  const [viewportW, setViewportW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => {
      setViewportW(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = viewportW < 768; // 필요하면 기준 조절

  return (
    <>
      <BgOverlay
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        exit={{ opacity: 0 }}
        key="modal-bg"
        // onPointerDown={() => modalContext[1](false)}
        onPointerDown={() => closeModal()}
      ></BgOverlay>
      <Wrapper
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        initial={{ y: height / 2 + 200, x: "-50%", opacity: 0 }}
        animate={
          isMobile && expendModalOpen
            ? { x: "-50%", y: "-80%", opacity: 1 }
            : isMobile
            ? {
                x: "-50%",
                y: "-50%",
                opacity: 1,
              }
            : {
                y: "-50%",
                x: expendModalOpen ? `-${parseInt(width) + 10}px` : "-50%",
                opacity: 1,
              }
        }
        exit={{ y: height / 2 + 200, x: "-50%", opacity: 0 }}
        transition={{ ease: [0.22, 0.78, 0.2, 0.99], duration: 0.25 }}
        height={height}
        width={width}
        key="modal-wrapper"
      >
        <Header>
          <Title>{modalContent.title}</Title>
          <SvgIcon
            onClick={() => {
              console.log("clicked");
              // modalContext[1](false);
              closeModal();
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.8799 16L23.6132 10.28C23.8643 10.0289 24.0054 9.6884 24.0054 9.33333C24.0054 8.97826 23.8643 8.63773 23.6132 8.38666C23.3622 8.13559 23.0217 7.99454 22.6666 7.99454C22.3115 7.99454 21.971 8.13559 21.7199 8.38666L15.9999 14.12L10.2799 8.38666C10.0288 8.13559 9.68832 7.99454 9.33325 7.99454C8.97818 7.99454 8.63766 8.13559 8.38659 8.38666C8.13551 8.63773 7.99446 8.97826 7.99446 9.33333C7.99446 9.6884 8.13551 10.0289 8.38659 10.28L14.1199 16L8.38659 21.72C8.26161 21.8439 8.16242 21.9914 8.09473 22.1539C8.02704 22.3164 7.99219 22.4906 7.99219 22.6667C7.99219 22.8427 8.02704 23.0169 8.09473 23.1794C8.16242 23.3419 8.26161 23.4894 8.38659 23.6133C8.51054 23.7383 8.658 23.8375 8.82048 23.9052C8.98296 23.9729 9.15724 24.0077 9.33325 24.0077C9.50927 24.0077 9.68354 23.9729 9.84602 23.9052C10.0085 23.8375 10.156 23.7383 10.2799 23.6133L15.9999 17.88L21.7199 23.6133C21.8439 23.7383 21.9913 23.8375 22.1538 23.9052C22.3163 23.9729 22.4906 24.0077 22.6666 24.0077C22.8426 24.0077 23.0169 23.9729 23.1794 23.9052C23.3418 23.8375 23.4893 23.7383 23.6132 23.6133C23.7382 23.4894 23.8374 23.3419 23.9051 23.1794C23.9728 23.0169 24.0076 22.8427 24.0076 22.6667C24.0076 22.4906 23.9728 22.3164 23.9051 22.1539C23.8374 21.9914 23.7382 21.8439 23.6132 21.72L17.8799 16Z"
                fill="#767676"
              />
            </svg>
          </SvgIcon>
        </Header>
        {/* <Body>{modalContext[0].child}</Body> */}
        <Body>
          <Child
            {...modalContent.childProps}
            setter={setExpendModalOpen}
            setSelectedEventId={setSelectedEventId}
            selectedEventId={selectedEventId}
          />
        </Body>
      </Wrapper>
      {expendModalOpen ? (
        <ExpendWrapper
          style={isMobile ? { zIndex: 1000 } : null}
          initial={
            isMobile
              ? { x: "-50%", y: "-50%", opacity: 0 }
              : { y: "-50%", opacity: 0 }
          }
          animate={
            isMobile
              ? {
                  x: "-50%",
                  y: 0,
                  opacity: 1,
                }
              : {
                  x: `10px`,
                  y: "-50%",
                  opacity: 1,
                }
          }
          exit={
            isMobile
              ? { x: "-50%", y: "-50%", opacity: 0 }
              : { y: "-50%", opacity: 0 }
          }
          transition={{ ease: [0.22, 0.78, 0.2, 0.99], duration: 0.5 }}
          $modalsize={{ width: width, height: height }}
        >
          <ExpendChild
            selectedEventId={selectedEventId}
            events={modalContent.childProps?.events}
            closeExpend={() => setExpendModalOpen(false)}
          />
        </ExpendWrapper>
      ) : null}
    </>
  );
}

// function useModal() {
//   const { modalObj, setModalObj } = useContext(ModalContext);
//   return [modalObj, setModalObj];
// }
const useModal = () => useContext(ModalContext);

export { ModalProvider, useModal };
