export function Document(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      >
        <rect width="15" height="18.5" x="4.5" y="2.75" rx="3.5"></rect>
        <path d="M8.5 6.755h7m-7 4h7m-7 4H12"></path>
      </g>
    </svg>
  );
}
