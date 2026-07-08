"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Map,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type AuthMode = "login" | "register";

interface AuthShellProps {
  mode: AuthMode;
}

interface AuthFieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: ReactNode;
  autoComplete: string;
  required?: boolean;
}

const modeCopy = {
  login: {
    eyebrow: "欢迎回来",
    title: "继续记录城市里的每一杯",
    description: "同步你的饮品足迹、收藏和本月口味画像。",
    button: "进入 SipNotes",
    helper: "还没有账号？",
    helperLink: "创建账号",
    helperHref: "/register",
    success: "已完成登录界面演示，正在返回应用。",
  },
  register: {
    eyebrow: "创建饮迹",
    title: "从今天开始收藏你的城市口味",
    description: "先建立一张个人饮品手账卡，后续可接入真实账号体系。",
    button: "创建并进入",
    helper: "已经有账号？",
    helperLink: "去登录",
    helperHref: "/login",
    success: "已完成注册界面演示，正在返回应用。",
  },
} satisfies Record<AuthMode, Record<string, string>>;

const AUTH_BACKGROUND_IMAGE = "/assets/generated/sipnotes-auth-background.webp";

function AuthField({
  id,
  label,
  placeholder,
  type = "text",
  icon,
  autoComplete,
  required = true,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-text-muted">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-outline">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={inputType}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-brand-surface bg-white pl-11 pr-12 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 placeholder:text-brand-outline"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-brand-outline transition hover:bg-brand-surface-low hover:text-brand-primary"
            aria-label={visible ? "隐藏密码" : "显示密码"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
    </label>
  );
}

function AuthPreviewCard({ mode }: { mode: AuthMode }) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-[0_14px_30px_rgba(121,87,63,0.10)]">
      <div className="overflow-hidden rounded-[22px] bg-brand-surface-low">
        <div className="relative h-40 bg-brand-primary/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(132,169,140,0.42),transparent_30%),linear-gradient(135deg,rgba(67,102,77,0.22),rgba(121,87,63,0.20))]" />
          <div className="absolute left-5 top-5 rounded-2xl bg-white/75 px-3 py-2 shadow-sm backdrop-blur">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-brand-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {mode === "login" ? "本月已记录 24 杯" : "新手手账已准备"}
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/60 bg-white/70 p-4 backdrop-blur">
            <p className="text-xs font-bold text-brand-text-muted">今日推荐</p>
            <p className="mt-1 font-display text-2xl font-black tracking-tight text-brand-text">
              生椰拿铁
            </p>
            <p className="mt-1 text-xs font-semibold text-brand-primary">
              上海 · 徐汇 · 口味偏清爽
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-2 pb-1 pt-4">
        <div>
          <p className="text-sm font-black text-brand-text">SipNotes 饮迹</p>
          <p className="text-xs font-semibold text-brand-text-muted">城市饮品手账</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white">
          <Map className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

export default function AuthShell({ mode }: AuthShellProps) {
  const copy = modeCopy[mode];
  const router = useRouter();
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(copy.success);
    window.setTimeout(() => {
      router.push("/");
    }, 700);
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-brand-surface-low bg-cover bg-center text-brand-text min-[768px]:flex min-[768px]:items-center min-[768px]:justify-center min-[768px]:bg-brand-surface min-[768px]:p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(238,238,234,0.72), rgba(238,238,234,0.9)), url('${AUTH_BACKGROUND_IMAGE}')`,
      }}
    >
      <div
        className="mx-auto box-border min-h-screen w-full max-w-[412px] overflow-x-hidden bg-brand-bg/88 bg-cover bg-center px-5 pb-8 pt-5 backdrop-blur-[1px] min-[768px]:min-h-[840px] min-[768px]:overflow-hidden min-[768px]:rounded-[36px] min-[768px]:border min-[768px]:border-white/70 min-[768px]:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
        style={{
          backgroundImage: `linear-gradient(rgba(250,249,245,0.82), rgba(250,249,245,0.94)), url('${AUTH_BACKGROUND_IMAGE}')`,
        }}
      >
        <header className="flex min-w-0 items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm transition hover:bg-brand-surface-low"
            aria-label="返回应用"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex min-w-0 items-center gap-2 text-brand-primary">
            <Map className="h-5 w-5" />
            <span className="font-display text-sm font-black tracking-tight">SipNotes 饮迹</span>
          </div>
        </header>

        <div className="mt-7 space-y-5">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </span>
            <div>
              <h1 className="font-display text-[32px] font-black leading-tight tracking-tight text-brand-text">
                {copy.title}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-brand-text-muted">
                {copy.description}
              </p>
            </div>
          </div>

          <AuthPreviewCard mode={mode} />

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-brand-surface bg-white p-5 shadow-[0_10px_24px_rgba(121,87,63,0.06)]"
          >
            <div className="space-y-4">
              {mode === "register" && (
                <AuthField
                  id="name"
                  label="昵称"
                  placeholder="给你的饮品手账取个名字"
                  autoComplete="name"
                  icon={<UserRound className="h-4 w-4" />}
                />
              )}
              <AuthField
                id="account"
                label="手机号或邮箱"
                placeholder="name@example.com"
                autoComplete={mode === "login" ? "username" : "email"}
                icon={<Mail className="h-4 w-4" />}
              />
              <AuthField
                id="password"
                label="密码"
                placeholder="输入密码"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                icon={<Lock className="h-4 w-4" />}
              />
              {mode === "register" && (
                <AuthField
                  id="confirmPassword"
                  label="确认密码"
                  placeholder="再次输入密码"
                  type="password"
                  autoComplete="new-password"
                  icon={<Lock className="h-4 w-4" />}
                />
              )}
            </div>

            {message && (
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-primary/10 px-3 py-2 text-xs font-bold text-brand-primary">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </p>
            )}

            <button
              type="submit"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-brand-primary text-sm font-black text-white shadow-[0_10px_20px_rgba(67,102,77,0.20)] transition hover:bg-brand-primary/95 active:scale-[0.99]"
            >
              {copy.button}
            </button>

            <p className="mt-4 text-center text-xs font-semibold text-brand-text-muted">
              {copy.helper}{" "}
              <Link href={copy.helperHref} className="font-black text-brand-primary hover:underline">
                {copy.helperLink}
              </Link>
            </p>
          </form>

          <p className="px-3 text-center text-[11px] font-semibold leading-5 text-brand-outline">
            当前为匿名 MVP 的视觉入口演示，不会创建真实账号或修改打卡数据。
          </p>
        </div>
      </div>
    </main>
  );
}
