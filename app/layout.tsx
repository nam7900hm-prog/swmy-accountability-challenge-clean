import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"나의 약속 챌린지", description:"12주 동안 학습과 생활 약속을 실천하며 나만의 미션을 완성하는 앱", other:{"codex-preview":"development"} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
