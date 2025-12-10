"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/server/auth/sign-in";
import { securityQuestionsSetOne, securityQuestionsSetTwo } from "@/utils/securityQuestions";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const successMessage = searchParams.get("success");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn(formData);

      if (result?.success) {
        router.push("/hub"); // redirect to your main page
      }
    } catch (error: unknown) {
      setLoading(false);

      // Type guard for Error
      if (error instanceof Error) {
        const parsed = JSON.parse(error.message);
        setErrors(parsed);
      } else {
        // Fallback if error is not an instance of Error
        setErrors({ general: "An unknown error occurred. Please try again." });
      }
    }
  };

  return (
    <main className="flex items-center justify-center text-center w-screen min-h-screen bg-gradient">
      <section className="flex flex-col items-center justify-center mx-auto max-lg:min-w-screen max-lg:min-h-screen lg:rounded-2xl px-5 lg:px-10 py-10 space-y-10 bg-background/80 text-white">
        <h1 className="text-5xl mb-5 font-bold text-gradient">SIGN IN</h1>
        <h3 className="text-xl">Welcome back! Sign in to continue.</h3>

        {/* Success message from sign-up */}
        {successMessage && (
          <p className="text-green-500! font-semibold mt-2">{decodeURIComponent(successMessage)}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-250"
        >
          {/* Left Column */}
          <div className="flex flex-col text-left space-y-5">
            {/* Username */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="username" className="font-medium mb-2">
                Username
                {errors.username && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.username}</span>
                )}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter Your Username"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-full bg-gradient" />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="password" className="font-medium mb-2">
                Password
                {errors.password && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.password}</span>
                )}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Your Password"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-full bg-gradient" />
            </div>

            {/* Forgot Password? */}
            <div className="mt-3">
              <Link href="/forgot-password" className="font-medium text-gradient self-start">
                Forgot Password?
              </Link>
            </div>
          
          </div>

          {/* Right Column */}
          <div className="flex flex-col text-left space-y-5">
            {/* Security Question 1 */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="securityQuestionOne" className="font-medium">
                Security Question 1
                {errors.securityAnswerOne && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.securityAnswerOne}</span>
                )}
              </label>
              <select name="securityQuestionOne" id="securityQuestionOne">
                {securityQuestionsSetOne.map(question => { 
                  return <option key={question} value={question} className="text-background">{question}</option>
                })}
              </select>
              <input
                name="securityAnswerOne"
                type="text"
                placeholder="Your Answer"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-auto bg-gradient" />
            </div>

            {/* Security Question 2 */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="securityQuestionTwo" className="font-medium">
                Security Question 2
                {errors.securityAnswerTwo && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.securityAnswerTwo}</span>
                )}
              </label>
              <select name="securityQuestionTwo" id="securityQuestionTwo">
                {securityQuestionsSetTwo.map(question => { 
                  return <option key={question} value={question} className="text-background">{question}</option>
                })}
              </select>
              <input
                name="securityAnswerTwo"
                type="text"
                placeholder="Your Answer"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-auto bg-gradient" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="rounded-lg bg-gradient font-bold py-1 hover:opacity-90 col-span-1 sm:col-span-2 w-full"
            disabled={loading}
          >
            {loading ? "Signing In..." : "SIGN IN"}
          </button>
        </form>

        {errors.general && <p className="text-red-500! mt-2">{errors.general}</p>}

        <h3>
          Don&apos;t have an account?
          <Link href="/sign-up" className="font-medium text-gradient ml-1">
            SIGN UP
          </Link>
        </h3>
      </section>
    </main>
  );
}
