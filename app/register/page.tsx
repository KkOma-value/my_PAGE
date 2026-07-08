import type { Metadata } from "next";
import AuthShell from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "注册 - SipNotes 饮迹",
  description: "创建 SipNotes 饮迹账号视觉入口，开始记录城市饮品手账。",
};

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}
