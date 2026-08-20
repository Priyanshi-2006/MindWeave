import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import logoImg from "@/assets/logo.png";
import foxImg from "@/assets/char-fox.png";
import catImg from "@/assets/char-cat.png";
import monkeyImg from "@/assets/char-monkey.png";
import breadImg from "@/assets/char-bread.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — MindWeave" },
      {
        name: "description",
        content: "Sign in to your MindWeave adaptive cognitive gaming account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{
    identifier?: boolean;
    password?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Client-side validation checks
  const identifierError =
    touched.identifier && !identifier.trim()
      ? "Please enter your username or email"
      : "";

  const passwordError =
    touched.password && !password
      ? "Please enter your password"
      : touched.password && password.length < 6
        ? "Password must be at least 6 characters"
        : "";

  const isFormValid = identifier.trim().length > 0 && password.length >= 6;

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    if (loginSuccess) setLoginSuccess(false);
    if (!touched.identifier) setTouched((t) => ({ ...t, identifier: true }));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (loginSuccess) setLoginSuccess(false);
    if (!touched.password) setTouched((t) => ({ ...t, password: true }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      // NOTE: Frontend scaffold. Backend authentication API integration will connect here.
      console.log("Login submitted with:", {
        identifier: identifier.trim(),
        password,
      });

      // Simulate brief network feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoginSuccess(true);
    } catch (err) {
      setLoginSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-8 select-none">
      {/* Soft playful ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.62_0.16_195/0.08),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.62_0.19_300/0.08),transparent_50%)]"
        aria-hidden="true"
      />

      {/* Decorative Peeking Animal Characters */}
      {/* Top-Left: Fox */}
      <img
        src={foxImg}
        alt=""
        aria-hidden
        width={160}
        height={160}
        className="pointer-events-none absolute -top-4 -left-4 hidden w-28 sm:w-36 rotate-12 drop-shadow-md lg:block opacity-90"
      />
      {/* Top-Right: Cat */}
      <img
        src={catImg}
        alt=""
        aria-hidden
        width={160}
        height={160}
        className="pointer-events-none absolute -top-4 -right-4 hidden w-28 sm:w-36 -rotate-12 drop-shadow-md lg:block opacity-90"
      />
      {/* Bottom-Left: Monkey */}
      <img
        src={monkeyImg}
        alt=""
        aria-hidden
        width={160}
        height={160}
        className="pointer-events-none absolute -bottom-4 -left-4 hidden w-28 sm:w-36 -rotate-12 drop-shadow-md lg:block opacity-90"
      />
      {/* Bottom-Right: Bread */}
      <img
        src={breadImg}
        alt=""
        aria-hidden
        width={160}
        height={160}
        className="pointer-events-none absolute -bottom-4 -right-4 hidden w-28 sm:w-36 rotate-12 drop-shadow-md lg:block opacity-90"
      />

      {/* Main Centered Login Card */}
      <div className="panel animate-pop relative z-10 w-full max-w-md p-6 sm:p-8 shadow-soft border-2 border-border">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            to="/"
            className="inline-block transition-transform hover:scale-105"
            aria-label="Go to MindWeave Home"
          >
            <img
              src={logoImg}
              alt="MindWeave"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
              width={200}
              height={70}
              loading="eager"
            />
          </Link>
          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-foreground">
            Welcome Back! 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-semibold">
            Sign in to continue your MindWeave journey.
          </p>
        </div>

        {/* Success Alert: Rendered ONLY when loginSuccess is true */}
        {loginSuccess ? (
          <div
            className="mb-5 rounded-xl border-2 border-success/40 bg-success/15 p-3 text-xs sm:text-sm font-semibold text-foreground animate-pop"
            role="alert"
          >
            ✅ Login submitted successfully! Backend authentication will connect
            here.
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email / Username Field */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Email or Username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
              placeholder="e.g. player@mindweave.app"
              aria-invalid={!!identifierError}
              aria-describedby={
                identifierError ? "identifier-error" : undefined
              }
              className={`w-full rounded-xl border-2 bg-background px-4 py-2.5 sm:py-3 text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground/60 ${
                identifierError
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-primary"
              }`}
            />
            {identifierError ? (
              <p
                id="identifier-error"
                className="mt-1 text-xs font-semibold text-destructive"
              >
                {identifierError}
              </p>
            ) : null}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="text-xs sm:text-sm font-bold text-foreground"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset will be connected with backend authentication.",
                  )
                }
                className="text-xs font-bold text-primary hover:underline transition-all"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                className={`w-full rounded-xl border-2 bg-background px-4 py-2.5 sm:py-3 pr-12 text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground/60 ${
                  passwordError
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {passwordError ? (
              <p
                id="password-error"
                className="mt-1 text-xs font-semibold text-destructive"
              >
                {passwordError}
              </p>
            ) : null}
          </div>

          {/* Login Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="toy-press w-full rounded-full bg-primary py-3 sm:py-3.5 font-display text-base sm:text-lg font-bold text-primary-foreground shadow-toy transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Signing in…" : "Login"}
            </button>
          </div>
        </form>

        {/* Sign Up Link Placeholder */}
        <div className="mt-6 text-center text-xs sm:text-sm font-semibold text-muted-foreground border-t border-border/60 pt-4">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() =>
              alert(
                "Registration will be connected with backend authentication.",
              )
            }
            className="font-bold text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
