// src/layouts/MobileShell.tsx
import { Outlet, ScrollRestoration } from "react-router-dom";
import BottomNav from "./BottomNav";
import SafeArea from "./SafeArea";
import Header from "./Header";
import KeepAlive from "react-activation";

export default function MobileShell() {
  return (
    <div className="app">
      {/* 상단 영역이 필요하면 헤더 배치 */}
      <SafeArea side="top">
        <Header />
      </SafeArea>
      <main
        style={{
          overflow: "hidden",
          paddingBottom: 70,
          paddingTop: 120 /* bottom nav height */,
        }}
      >
        <Outlet />
      </main>
      <SafeArea side="bottom">
        <BottomNav />
      </SafeArea>
      <ScrollRestoration />
    </div>
  );
}
