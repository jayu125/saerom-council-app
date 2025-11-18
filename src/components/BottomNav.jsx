// src/components/nav/BottomNav.tsx
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { usePage } from "../pageProvider";

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 10px 20px 20px 20px;
  &:active {
    transition: all 0.2s;
    transform: var(--active-transform);
    background-color: var(--background-elevate);
  }
`;

const SvgWrap = styled.div``;

const tabs = [
  {
    to: "/",
    label: "캘린더",
    exact: true,
    svg: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.8333 5.54169H8.16667C5.58934 5.54169 3.5 7.63102 3.5 10.2084V21C3.5 23.5773 5.58934 25.6667 8.16667 25.6667H19.8333C22.4107 25.6667 24.5 23.5773 24.5 21V10.2084C24.5 7.63102 22.4107 5.54169 19.8333 5.54169Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.33334 3.79169V7.29169"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.8333 3.79169V7.29169"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 11.375H24.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.33334 16.3217V16.3324"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 16.3217V16.3324"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6667 16.3217V16.3324"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6667 20.9883V20.9991"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 20.9883V20.9991"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.33334 20.9883V20.9991"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/department",
    label: "부서",
    svg: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.3833 5.25H6.88333C5.91683 5.25 5.13333 6.0335 5.13333 7V10.5C5.13333 11.4665 5.91683 12.25 6.88333 12.25H10.3833C11.3498 12.25 12.1333 11.4665 12.1333 10.5V7C12.1333 6.0335 11.3498 5.25 10.3833 5.25Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1333 19.25C12.1333 17.317 10.5663 15.75 8.63333 15.75C6.70033 15.75 5.13333 17.317 5.13333 19.25C5.13333 21.183 6.70033 22.75 8.63333 22.75C10.5663 22.75 12.1333 21.183 12.1333 19.25Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.8833 16.3333H17.3833C16.4168 16.3333 15.6333 17.1168 15.6333 18.0833V21.5833C15.6333 22.5498 16.4168 23.3333 17.3833 23.3333H20.8833C21.8498 23.3333 22.6333 22.5498 22.6333 21.5833V18.0833C22.6333 17.1168 21.8498 16.3333 20.8833 16.3333Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.25 5.41333L15.6333 11.6667H22.8667L19.25 5.41333Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/meeting",
    label: "회의",
    svg: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.64 4.95831H18.6667C19.5949 4.95831 20.4852 5.32706 21.1415 5.98344C21.7979 6.63982 22.1667 7.53006 22.1667 8.45831V21.2916C22.1667 22.2199 21.7979 23.1101 21.1415 23.7665C20.4852 24.4229 19.5949 24.7916 18.6667 24.7916H9.33333C8.40507 24.7916 7.51483 24.4229 6.85845 23.7665C6.20208 23.1101 5.83333 22.2199 5.83333 21.2916V8.45831C5.83333 7.53006 6.20208 6.63982 6.85845 5.98344C7.51483 5.32706 8.40507 4.95831 9.33333 4.95831H10.3833"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
        <path
          d="M17.5 15.1667H10.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.7 18.6667H10.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 11.6667H10.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.75 3.20831H12.25C11.2835 3.20831 10.5 3.99181 10.5 4.95831C10.5 5.92481 11.2835 6.70831 12.25 6.70831H15.75C16.7165 6.70831 17.5 5.92481 17.5 4.95831C17.5 3.99181 16.7165 3.20831 15.75 3.20831Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/myPage",
    label: "마이",
    svg: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 10.6275C14.7949 10.6275 16.25 9.17243 16.25 7.3775C16.25 5.58258 14.7949 4.1275 13 4.1275C11.2051 4.1275 9.75 5.58258 9.75 7.3775C9.75 9.17243 11.2051 10.6275 13 10.6275Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.875 21.8725C4.875 19.7176 5.73102 17.651 7.25476 16.1273C8.77849 14.6035 10.8451 13.7475 13 13.7475C15.1549 13.7475 17.2215 14.6035 18.7452 16.1273C20.269 17.651 21.125 19.7176 21.125 21.8725"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pageContext = usePage();
  return (
    <nav
      aria-label="하단 내비게이션"
      id="bottom-nav"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 80,
        paddingBottom: 10,
        display: "grid",
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        alignItems: "center",
        zIndex: 996,
        boxSizing: "border-box",
        boxShadow: "0px 4px 8px 2px rgba(0, 0, 0, 0.075)",
      }}
    >
      {tabs.map((t) => (
        <NavItem
          onClick={() => {
            pageContext[1](t.label);
          }}
          key={t.to}
          to={t.to}
          end={t.exact}
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#f8f9fe" : "#666",
            fontWeight: isActive ? 800 : 600,
            fontSize: 10,
            justifySelf: "center",
            // padding: "6px 10px",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          })}
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          {t.svg}
          {/* {t.label} */}
        </NavItem>
      ))}
    </nav>
  );
}
