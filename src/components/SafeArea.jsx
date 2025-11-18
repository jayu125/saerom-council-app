export default function SafeArea({ side = "bottom", children }) {
  const varName =
    side === "top" ? "safe-area-inset-top" : "safe-area-inset-bottom";
  return (
    <div
      style={{
        paddingBottom: side === "bottom" ? `env(${varName})` : 0,
        paddingTop: side === "top" ? `env(${varName})` : 0,
      }}
    >
      {children}
    </div>
  );
}
