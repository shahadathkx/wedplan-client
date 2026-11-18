import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[#faf7f4] px-4 py-20">
          <div className="h-[480px] w-full max-w-[500px] animate-pulse rounded-[2rem] bg-white" />
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
