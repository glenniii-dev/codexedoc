"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { updateUser } from "@/server/mutations/update/updateUser";
import { securityQuestionsSetOne, securityQuestionsSetTwo } from "@/utils/securityQuestions";
import { signOut } from "@/server/auth/sign-out";

type User = {
  name: string;
  bio: string;
  image: string;
  securityQuestionOne: string;
  securityQuestionTwo: string;
};

type ModalType = "profile" | "password" | "security" | null;
type Errors = Record<string, string>;

export default function SettingsClient({ user }: { user: User }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [imageFile, setImageFile] = useState<File | null>(null);

  /* ---------------- IMAGE ---------------- */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    });

    const finalFile = new File([compressed], file.name, { type: file.type });
    setImageFile(finalFile);
    setImagePreview(URL.createObjectURL(finalFile));
  };

  /* ---------------- SUBMIT ---------------- */
  const submit = async (form: HTMLFormElement) => {
    setErrors({});
    setLoading(true);

    const formData = new FormData(form);
    if (imageFile) formData.set("image", imageFile);

    try {
      await updateUser(formData);
      setActiveModal(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors(JSON.parse(err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center flex-col text-center mx-auto w-full py-10">
      <h1 className="text-5xl mb-2 font-bold text-gradient">SETTINGS</h1>
      <h3 className="text-xl mb-6">Manage your profile & security</h3>

      {/* PROFILE PREVIEW */}
      <section className="flex flex-col w-full max-w-250 space-y-6 bg-background/50 p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-400 bg-background/30">
            {imagePreview ? (
              <Image src={imagePreview} alt="Profile" fill className="object-cover" />
            ) : (
              <span className="flex items-center justify-center h-full text-gray-400">
                No Image
              </span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold capitalize">{user.name}</h2>
            <p className="opacity-70 mt-2">{user.bio || "No bio provided."}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionButton onClick={() => setActiveModal("profile")}>
            Edit Profile
          </ActionButton>
          <ActionButton onClick={() => setActiveModal("password")}>
            Change Password
          </ActionButton>
          <ActionButton onClick={() => setActiveModal("security")}>
            Security Settings
          </ActionButton>
        </div>
      </section>

      {/* MODALS */}
      {activeModal && (
        <Modal onClose={() => setActiveModal(null)}>
          {/* PROFILE */}
          {activeModal === "profile" && (
            <FormWrapper
              title="Edit Profile"
              onSubmit={submit}
              loading={loading}
            >
              <Field label="Name" error={errors.name}>
                <input name="name" defaultValue={user.name} className="input" />
              </Field>

              <Field label="Bio" error={errors.bio}>
                <textarea
                  name="bio"
                  defaultValue={user.bio}
                  rows={4}
                  className="textarea"
                />
              </Field>

              <Field label="Profile Image">
                <div
                  className="relative w-full h-40 border-2 border-dashed border-gray-400 rounded overflow-hidden flex items-center justify-center cursor-pointer bg-background/30"
                  onClick={() => document.getElementById("imageInput")?.click()}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <span className="text-gray-400">Click to upload image</span>
                  )}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </div>
              </Field>
            </FormWrapper>
          )}

          {/* PASSWORD */}
          {activeModal === "password" && (
            <FormWrapper
              title="Change Password"
              onSubmit={submit}
              loading={loading}
            >
              <SecurityGate errors={errors} />

              <input name="password" type="password" placeholder="New password" className="input" />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                className="input"
              />
            </FormWrapper>
          )}

          {/* SECURITY */}
            {activeModal === "security" && (
              <FormWrapper
                title="Security Settings"
                onSubmit={submit}
                loading={loading}
              >
                <SecurityGate errors={errors} />

                {/* Question 1 */}
                <Field label="Security Question 1">
                  <select
                    name="securityQuestionOne"
                    defaultValue={user.securityQuestionOne}
                    className="input"
                  >
                    {securityQuestionsSetOne.map((q) => (
                      <option key={q} value={q} className="text-background">
                        {q}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Answer 1" error={errors.securityAnswerOne}>
                  <input
                    name="securityAnswerOne"
                    placeholder="New answer"
                    className="input"
                  />
                </Field>

                {/* Question 2 */}
                <Field label="Security Question 2">
                  <select
                    name="securityQuestionTwo"
                    defaultValue={user.securityQuestionTwo}
                    className="input"
                  >
                    {securityQuestionsSetTwo.map((q) => (
                      <option key={q} value={q} className="text-background">
                        {q}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Answer 2" error={errors.securityAnswerTwo}>
                  <input
                    name="securityAnswerTwo"
                    placeholder="New answer"
                    className="input"
                  />
                </Field>
              </FormWrapper>
            )}
        </Modal>
      )}
      <button onClick={signOut} className="rounded-2xl bg-gradient font-bold py-2 px-10 hover:opacity-90 mt-10">Sign Out</button>
    </main>
  );
}

/* ===================== UI HELPERS ===================== */

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-lg bg-gradient font-bold py-2 hover:opacity-90 w-full"
    >
      {children}
    </button>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-250 bg-background/90 p-8 rounded-2xl relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-xl opacity-60 hover:opacity-100"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function FormWrapper({
  title,
  onSubmit,
  loading,
  children,
}: {
  title: string;
  onSubmit: (form: HTMLFormElement) => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e.currentTarget);
      }}
      className="flex flex-col space-y-6"
    >
      <h2 className="text-3xl font-bold text-gradient">{title}</h2>
      {children}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gradient font-bold py-2 hover:opacity-90 w-full"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col text-left">
      <label className="font-medium mb-1">
        {label}
        {error && <span className="text-red-500! text-xs ml-2">{error}</span>}
      </label>
      {children}
      <hr className="h-0.5 w-full bg-gradient mt-1" />
    </div>
  );
}

function SecurityGate({ errors }: { errors: Errors }) {
  return (
    <Field label="Security Code" error={errors.securityCode}>
      <input
        name="securityCode"
        type="password"
        placeholder="Required to continue"
        className="input"
      />
    </Field>
  );
}