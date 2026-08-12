import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { SitePage } from "@/components/layout/SitePage";

export const metadata = {
  title: "Sign In - Invoice Generator",
};

export default function SignInPage() {
  return (
    <SitePage>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <div className="app-spinner" style={{ width: 28, height: 28 }} />
          </div>
        }
      >
        <AuthForm mode="sign-in" />
      </Suspense>
    </SitePage>
  );
}
