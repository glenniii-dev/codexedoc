"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/server/auth/sign-up";
import { securityQuestionsSetOne, securityQuestionsSetTwo } from "@/utils/securityQuestions";

export default function SignUpPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signUp(formData);

      // On success, redirect to sign-in with message
      if (result?.success) {
        router.push(`/sign-in?success=${encodeURIComponent(result.message)}`);
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
        <h1 className="text-5xl mb-5 font-bold text-gradient">SIGN UP</h1>
        <h3 className="text-xl">Welcome! Create your account to begin.</h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-250"
        >
          {/* Left Column */}
          <div className="flex flex-col text-left space-y-5">
            {/* Name */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="font-medium mb-2">
                Name
                {errors.name && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.name}</span>
                )}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter Your Name"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-full bg-gradient" />
            </div>

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

            {/* Confirm Password */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="confirmPassword" className="font-medium mb-2">
                Confirm Password
                {errors.confirmPassword && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.confirmPassword}</span>
                )}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-full bg-gradient" />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col text-left space-y-[21px]">
            {/* Security Question 1 */}
            <div className="flex flex-col space-y-3.5">
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
            <div className="flex flex-col space-y-3.5">
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

            {/* Security Code */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="securityCode" className="font-medium">
                Security Code
                {errors.securityCode && (
                  <span className="text-red-500! text-xs font-semibold ml-2">{errors.securityCode}</span>
                )}
              </label>
              <input
                id="securityCode"
                name="securityCode"
                type="text"
                placeholder="Enter Your Security Code"
                className="p-[5px] outline-none"
              />
              <hr className="h-0.5 w-auto bg-gradient" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col col-span-1 sm:col-span-2 w-full text-left">
            <h3 className="text-2xl font-bold text-gradient mb-2">NOTICE:</h3>
            <p className="font-semibold">Please provide secure answers and write down the credentials above, you&apos;ll need them to sign in. Keep them safe!</p>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gradient font-bold py-1 hover:opacity-90 col-span-1 sm:col-span-2 w-full"
            disabled={loading}
          >
            {loading ? "Submitting..." : "SIGN UP"}
          </button>
        </form>

        {errors.general && <p className="text-red-500! mt-2">{errors.general}</p>}

        <h3>
          Already have an account?
          <Link href="/sign-in" className="font-medium text-gradient ml-1">
            SIGN IN
          </Link>
        </h3>
      </section>
    </main>
  );
}
