import type { Metadata } from "next";
import AuthShell from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "登录 - SipNotes 饮迹",
  description: "登录 SipNotes 饮迹，继续记录城市饮品足迹。",
};

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
