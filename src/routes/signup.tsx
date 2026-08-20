import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useProfile } from "@/lib/intelliplay/store";
import logoImg from "@/assets/logo.png";
import foxImg from "@/assets/char-fox.png";
import catImg from "@/assets/char-cat.png";
import monkeyImg from "@/assets/char-monkey.png";
import breadImg from "@/assets/char-bread.png";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — MindWeave" },
      {
        name: "description",
        content:
          "Create your MindWeave account and begin your adaptive cognitive gaming journey.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { signup } = useProfile();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    identifier?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Client-side validation
  const fullNameError =
    touched.fullName && !fullName.trim() ? "Please enter your full name" : "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = identifier.includes("@");
  const identifierError =
    touched.identifier && !identifier.trim()
      ? "Please enter your email or username"
      : touched.identifier && isEmail && !emailRegex.test(identifier.trim())
        ? "Please enter a valid email address"
        : "";

  const passwordError =
    touched.password && !password
      ? "Please enter your password"
      : touched.password && password.length < 6
        ? "Password must be at least 6 characters"
        : "";

  const confirmPasswordError =
    touched.confirmPassword && !confirmPassword
      ? "Please confirm your password"
      : touched.confirmPassword && confirmPassword !== password
        ? "Passwords do not match"
        : "";

  const isFormValid =
    fullName.trim().length > 0 &&
    identifier.trim().length > 0 &&
    (!isEmail || emailRegex.test(identifier.trim())) &&
    password.length >= 6 &&
    confirmPassword === password;

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (signupSuccess) setSignupSuccess(false);
    if (!touched.fullName) setTouched((t) => ({ ...t, fullName: true }));
  };

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    if (signupSuccess) setSignupSuccess(false);
    if (!touched.identifier) setTouched((t) => ({ ...t, identifier: true }));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (signupSuccess) setSignupSuccess(false);
    if (!touched.password) setTouched((t) => ({ ...t, password: true }));
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (signupSuccess) setSignupSuccess(false);
    if (!touched.confirmPassword)
      setTouched((t) => ({ ...t, confirmPassword: true }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      identifier: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      // NOTE: Frontend scaffold. Backend registration API will connect here.
      console.log("Sign up submitted with:", {
        fullName: fullName.trim(),
        identifier: identifier.trim(),
        password,
      });

      // Simulate brief network feedback
      await new Promise((resolve) => setTimeout(resolve, 400));

      signup(fullName.trim(), identifier.trim());
      setSignupSuccess(true);
      navigate({ to: "/login" });
    } catch (err) {
      setSignupSuccess(false);
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

      {/* Main Centered Sign Up Card */}
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
            Create Your Account! 🧠
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-semibold">
            Start your MindWeave journey today.
          </p>
        </div>

        {/* Success Alert: Rendered ONLY when signupSuccess is true */}
        {signupSuccess ? (
          <div
            className="mb-5 rounded-xl border-2 border-success/40 bg-success/15 p-3 text-xs sm:text-sm font-semibold text-foreground animate-pop"
            role="alert"
          >
            ✅ Account created successfully! Backend registration will connect
            here.
          </div>
        ) : null}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              placeholder="e.g. Maya Lin"
              aria-invalid={!!fullNameError}
              aria-describedby={fullNameError ? "fullname-error" : undefined}
              className={`w-full rounded-xl border-2 bg-background px-4 py-2.5 sm:py-3 text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground/60 ${
                fullNameError
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-primary"
              }`}
            />
            {fullNameError ? (
              <p
                id="fullname-error"
                className="mt-1 text-xs font-semibold text-destructive"
              >
                {fullNameError}
              </p>
            ) : null}
          </div>

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
              autoComplete="email"
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
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={() =>
                  setTouched((t) => ({ ...t, confirmPassword: true }))
                }
                placeholder="••••••••"
                aria-invalid={!!confirmPasswordError}
                aria-describedby={
                  confirmPasswordError ? "confirm-password-error" : undefined
                }
                className={`w-full rounded-xl border-2 bg-background px-4 py-2.5 sm:py-3 pr-12 text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground/60 ${
                  confirmPasswordError
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPasswordError ? (
              <p
                id="confirm-password-error"
                className="mt-1 text-xs font-semibold text-destructive"
              >
                {confirmPasswordError}
              </p>
            ) : null}
          </div>

          {/* Create Account Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="toy-press w-full rounded-full bg-primary py-3 sm:py-3.5 font-display text-base sm:text-lg font-bold text-primary-foreground shadow-toy transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Creating account…" : "Create Account"}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-xs sm:text-sm font-semibold text-muted-foreground border-t border-border/60 pt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-primary hover:underline transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
