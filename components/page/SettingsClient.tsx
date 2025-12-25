// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import imageCompression from "browser-image-compression";
// import { updateUser } from "@/server/mutations/update/updateUser";
// import { updateCircle } from "@/server/mutations/update/updateCircle";
// import { deleteCircle } from "@/server/mutations/delete/deleteCircle";
// import { leaveCircle } from "@/server/mutations/update/leaveCircle";
// import { securityQuestionsSetOne, securityQuestionsSetTwo } from "@/utils/securityQuestions";
// import { signOut } from "@/server/auth/sign-out";

// type User = {
//   name: string;
//   bio: string;
//   image: string;
//   securityQuestionOne: string;
//   securityQuestionTwo: string;
// };

// type Circle = {
//   id: string;
//   name: string;
//   image: string;
//   description: string;
//   tags: string[];
//   role: "owner" | "member";
// };

// type ModalType = "profile" | "password" | "security" | "editCircle" | "deleteCircle" | null;
// type Errors = Record<string, string>;

// export default function SettingsClient({ user }: { user: User & { circles: Circle[] } }) {
//   const [activeModal, setActiveModal] = useState<ModalType>(null);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Errors>({});
//   const [imagePreview, setImagePreview] = useState<string | null>(user.image);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

//   /* ---------------- IMAGE HANDLER ---------------- */
//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const compressed = await imageCompression(file, {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1024,
//     });

//     const finalFile = new File([compressed], file.name, { type: file.type });
//     setImageFile(finalFile);
//     setImagePreview(URL.createObjectURL(finalFile));
//   };

//   /* ---------------- SUBMIT HANDLER ---------------- */
//   const submit = async (form: HTMLFormElement, action: "user" | "circle") => {
//     setErrors({});
//     setLoading(true);

//     const formData = new FormData(form);
//     if (imageFile && action === "user") formData.set("image", imageFile);
//     if (imageFile && action === "circle" && selectedCircle) {
//       formData.append("circleId", selectedCircle.id);
//       formData.set("image", imageFile);
//     }

//     try {
//       if (action === "user") {
//         await updateUser(formData);
//       } else if (action === "circle") {
//         if (activeModal === "deleteCircle") {
//           await deleteCircle(formData);
//         } else {
//           await updateCircle(formData);
//         }
//       }
//       setActiveModal(null);
//       setSelectedCircle(null);
//       setImagePreview(user.image);
//       setImageFile(null);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setErrors(JSON.parse(err.message));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLeaveCircle = async (circleId: string) => {
//     if (!confirm("Are you sure you want to leave this circle?")) return;
//     const formData = new FormData();
//     formData.append("circleId", circleId);
//     try {
//       await leaveCircle(formData);
//     } catch {
//       alert("Failed to leave circle");
//     }
//   };

//   return (
//     <main className="flex items-center justify-center flex-col text-center mx-auto w-full py-10 space-y-12">
//       <h1 className="text-5xl mb-2 font-bold text-gradient">SETTINGS</h1>
//       <h3 className="text-xl mb-6">Manage your profile & security</h3>

//       {/* PROFILE PREVIEW */}
//       <section className="flex flex-col w-full max-w-250 space-y-6 bg-background/50 p-8 rounded-2xl">
//         <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
//           <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-400 bg-background/30">
//             {imagePreview ? (
//               <Image src={imagePreview} alt="Profile" fill className="object-cover" />
//             ) : (
//               <span className="flex items-center justify-center h-full text-gray-400">No Image</span>
//             )}
//           </div>

//           <div className="flex-1">
//             <h2 className="text-2xl font-bold capitalize">{user.name}</h2>
//             <p className="opacity-70 mt-2">{user.bio || "No bio provided."}</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <ActionButton onClick={() => setActiveModal("profile")}>Edit Profile</ActionButton>
//           <ActionButton onClick={() => setActiveModal("password")}>Change Password</ActionButton>
//           <ActionButton onClick={() => setActiveModal("security")}>Security Settings</ActionButton>
//         </div>
//       </section>

//       {/* CIRCLES MANAGEMENT */}
//       <section className="w-full max-w-250 space-y-6 bg-background/50 p-8 rounded-2xl">
//         <h2 className="text-3xl font-bold text-gradient text-left">Your Circles</h2>

//         {user.circles.length === 0 ? (
//           <p className="text-left opacity-70">You are not part of any circles yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {user.circles.map((circle) => (
//               <div key={circle.id} className="flex items-center gap-4 bg-background/30 p-4 rounded-xl">
//                 <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0">
//                   <Image src={circle.image || "/placeholder-circle.png"} alt={circle.name} fill className="object-cover" />
//                 </div>
//                 <div className="flex-1 text-left">
//                   <h3 className="font-bold capitalize">{circle.name}</h3>
//                   <p className="text-sm opacity-70 line-clamp-2">{circle.description}</p>
//                   <p className="text-xs mt-1 opacity-50">Role: {circle.role}</p>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   {circle.role === "owner" ? (
//                     <>
//                       <ActionButton
//                         onClick={() => {
//                           setSelectedCircle(circle);
//                           setImagePreview(circle.image);
//                           setImageFile(null);
//                           setActiveModal("editCircle");
//                         }}
//                       >
//                         Edit
//                       </ActionButton>
//                       <ActionButton
//                         onClick={() => {
//                           setSelectedCircle(circle);
//                           setActiveModal("deleteCircle");
//                         }}
//                         className="bg-red-600 hover:bg-red-700"
//                       >
//                         Delete
//                       </ActionButton>
//                     </>
//                   ) : (
//                     <ActionButton
//                       onClick={() => handleLeaveCircle(circle.id)}
//                       className="bg-orange-600 hover:bg-orange-700"
//                     >
//                       Leave
//                     </ActionButton>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* MODALS */}
//       {activeModal && (
//         <Modal onClose={() => {
//           setActiveModal(null);
//           setSelectedCircle(null);
//           setImagePreview(user.image);
//           setImageFile(null);
//         }}>
//           {/* PROFILE */}
//           {activeModal === "profile" && (
//             <FormWrapper title="Edit Profile" onSubmit={(f) => submit(f, "user")} loading={loading}>
//               <Field label="Name" error={errors.name}>
//                 <input name="name" defaultValue={user.name} className="input" />
//               </Field>

//               <Field label="Bio" error={errors.bio}>
//                 <textarea name="bio" defaultValue={user.bio} rows={4} className="textarea" />
//               </Field>

//               <Field label="Profile Image">
//                 <div
//                   className="relative w-full h-40 border-2 border-dashed border-gray-400 rounded overflow-hidden flex items-center justify-center cursor-pointer bg-background/30"
//                   onClick={() => document.getElementById("imageInput")?.click()}
//                 >
//                   {imagePreview ? (
//                     <Image src={imagePreview} alt="Preview" fill className="object-cover" />
//                   ) : (
//                     <span className="text-gray-400">Click to upload image</span>
//                   )}
//                   <input
//                     id="imageInput"
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={handleImageChange}
//                   />
//                 </div>
//               </Field>
//             </FormWrapper>
//           )}

//           {/* PASSWORD & SECURITY - unchanged */}
//           {activeModal === "password" && (
//             <FormWrapper title="Change Password" onSubmit={(f) => submit(f, "user")} loading={loading}>
//               <SecurityGate errors={errors} />
//               <input name="password" type="password" placeholder="New password" className="input" />
//               <input name="confirmPassword" type="password" placeholder="Confirm password" className="input" />
//             </FormWrapper>
//           )}

//           {activeModal === "security" && (
//             <FormWrapper title="Security Settings" onSubmit={(f) => submit(f, "user")} loading={loading}>
//               <SecurityGate errors={errors} />
//               <Field label="Security Question 1">
//                 <select name="securityQuestionOne" defaultValue={user.securityQuestionOne} className="input">
//                   {securityQuestionsSetOne.map((q) => (
//                     <option key={q} value={q}>{q}</option>
//                   ))}
//                 </select>
//               </Field>
//               <Field label="Answer 1" error={errors.securityAnswerOne}>
//                 <input name="securityAnswerOne" placeholder="New answer" className="input" />
//               </Field>
//               <Field label="Security Question 2">
//                 <select name="securityQuestionTwo" defaultValue={user.securityQuestionTwo} className="input">
//                   {securityQuestionsSetTwo.map((q) => (
//                     <option key={q} value={q}>{q}</option>
//                   ))}
//                 </select>
//               </Field>
//               <Field label="Answer 2" error={errors.securityAnswerTwo}>
//                 <input name="securityAnswerTwo" placeholder="New answer" className="input" />
//               </Field>
//             </FormWrapper>
//           )}

//           {/* EDIT CIRCLE */}
//           {activeModal === "editCircle" && selectedCircle && (
//             <FormWrapper title="Edit Circle" onSubmit={(f) => submit(f, "circle")} loading={loading}>
//               <input type="hidden" name="circleId" value={selectedCircle.id} />
//               <Field label="Name" error={errors.name}>
//                 <input name="name" defaultValue={selectedCircle.name} className="input" />
//               </Field>
//               <Field label="Description" error={errors.description}>
//                 <textarea name="description" defaultValue={selectedCircle.description} rows={4} className="textarea" />
//               </Field>
//               <Field label="Tags (one per field)">
//                 {selectedCircle.tags.slice(0, 12).map((tag, i) => (
//                   <input key={i} name="tags" defaultValue={tag} placeholder="Tag" className="input mt-2" />
//                 ))}
//                 {Array.from({ length: 12 - selectedCircle.tags.length }).map((_, i) => (
//                   <input key={i + selectedCircle.tags.length} name="tags" placeholder="Tag" className="input mt-2" />
//                 ))}
//                 {errors.tags && <span className="text-red-500 text-xs mt-1">{errors.tags}</span>}
//               </Field>
//               <Field label="Circle Image">
//                 <div
//                   className="relative w-full h-40 border-2 border-dashed border-gray-400 rounded overflow-hidden flex items-center justify-center cursor-pointer bg-background/30"
//                   onClick={() => document.getElementById("circleImageInput")?.click()}
//                 >
//                   {imagePreview ? (
//                     <Image src={imagePreview} alt="Preview" fill className="object-cover" />
//                   ) : (
//                     <span className="text-gray-400">Click to upload image</span>
//                   )}
//                   <input
//                     id="circleImageInput"
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={handleImageChange}
//                   />
//                 </div>
//               </Field>
//             </FormWrapper>
//           )}

//           {/* DELETE CIRCLE */}
//           {activeModal === "deleteCircle" && selectedCircle && (
//             <FormWrapper title="Delete Circle" onSubmit={(f) => submit(f, "circle")} loading={loading}>
//               <input type="hidden" name="circleId" value={selectedCircle.id} />
//               <p className="text-left text-red-400 font-medium">
//                 Warning: This action is permanent and cannot be undone.
//               </p>
//               <p className="text-left mt-4">
//                 To confirm deletion, type the circle name exactly: <strong>{selectedCircle.name}</strong>
//               </p>
//               <Field label="Circle Name" error={errors.confirmationName}>
//                 <input name="confirmationName" placeholder={selectedCircle.name} className="input" />
//               </Field>
//             </FormWrapper>
//           )}
//         </Modal>
//       )}

//       <button onClick={signOut} className="rounded-2xl bg-gradient font-bold py-2 px-10 hover:opacity-90">
//         Sign Out
//       </button>
//     </main>
//   );
// }

// /* ===================== UI HELPERS ===================== */
// // (ActionButton, Modal, FormWrapper, Field, SecurityGate remain exactly the same as before)

// function ActionButton({
//   children,
//   onClick,
//   className,
// }: {
//   children: React.ReactNode;
//   onClick?: () => void;
//   className?: string;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       type="button"
//       className={`rounded-lg bg-gradient font-bold py-2 px-4 hover:opacity-90 text-sm ${className || ""}`}
//     >
//       {children}
//     </button>
//   );
// }

// function Modal({
//   children,
//   onClose,
// }: {
//   children: React.ReactNode;
//   onClose: () => void;
// }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//       <div className="w-full max-w-250 bg-background/90 p-8 rounded-2xl relative">
//         <button
//           onClick={onClose}
//           type="button"
//           className="absolute top-4 right-4 text-xl opacity-60 hover:opacity-100"
//         >
//           ✕
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

// function FormWrapper({
//   title,
//   onSubmit,
//   loading,
//   children,
// }: {
//   title: string;
//   onSubmit: (form: HTMLFormElement) => void;
//   loading: boolean;
//   children: React.ReactNode;
// }) {
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         onSubmit(e.currentTarget);
//       }}
//       className="flex flex-col space-y-6"
//     >
//       <h2 className="text-3xl font-bold text-gradient">{title}</h2>
//       {children}
//       <button
//         type="submit"
//         disabled={loading}
//         className="rounded-lg bg-gradient font-bold py-2 hover:opacity-90 w-full"
//       >
//         {loading ? "Saving..." : "Save Changes"}
//       </button>
//     </form>
//   );
// }

// function Field({
//   label,
//   error,
//   children,
// }: {
//   label: string;
//   error?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex flex-col text-left">
//       <label className="font-medium mb-1">
//         {label}
//         {error && <span className="text-red-500! text-xs ml-2">{error}</span>}
//       </label>
//       {children}
//       <hr className="h-0.5 w-full bg-gradient mt-1" />
//     </div>
//   );
// }

// function SecurityGate({ errors }: { errors: Errors }) {
//   return (
//     <Field label="Security Code" error={errors.securityCode}>
//       <input
//         name="securityCode"
//         type="password"
//         placeholder="Required to continue"
//         className="input"
//       />
//     </Field>
//   );
// }
"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { updateUser } from "@/server/mutations/update/updateUser";
import { updateCircle } from "@/server/mutations/update/updateCircle";
import { deleteCircle } from "@/server/mutations/delete/deleteCircle";
import { leaveCircle } from "@/server/mutations/update/leaveCircle";
import { securityQuestionsSetOne, securityQuestionsSetTwo } from "@/utils/securityQuestions";
import { signOut } from "@/server/auth/sign-out";

type User = {
  name: string;
  bio: string;
  image: string;
  securityQuestionOne: string;
  securityQuestionTwo: string;
};

type Circle = {
  id: string;
  name: string;
  image: string;
  description: string;
  tags: string[];
  role: "owner" | "member";
};

type ModalType = "profile" | "password" | "security" | "editCircle" | "deleteCircle" | null;
type Errors = Record<string, string>;

export default function SettingsClient({ user }: { user: User & { circles: Circle[] } }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  /* ---------------- IMAGE HANDLER ---------------- */
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

  /* ---------------- SUBMIT HANDLER ---------------- */
  const submit = async (form: HTMLFormElement, action: "user" | "circle") => {
    setErrors({});
    setLoading(true);

    const formData = new FormData(form);
    if (imageFile && action === "user") formData.set("image", imageFile);
    if (imageFile && action === "circle" && selectedCircle) {
      formData.append("circleId", selectedCircle.id);
      formData.set("image", imageFile);
    }

    try {
      if (action === "user") {
        await updateUser(formData);
      } else if (action === "circle") {
        if (activeModal === "deleteCircle") {
          await deleteCircle(formData);
        } else {
          await updateCircle(formData);
        }
      }
      setActiveModal(null);
      setSelectedCircle(null);
      setImagePreview(user.image);
      setImageFile(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors(JSON.parse(err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    if (!confirm("Are you sure you want to leave this circle?")) return;
    const formData = new FormData();
    formData.append("circleId", circleId);
    try {
      await leaveCircle(formData);
    } catch {
      alert("Failed to leave circle");
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-start mx-auto w-full py-10 space-y-12 max-md:pt-10">
      <h1 className="text-5xl mb-2 font-bold text-gradient">SETTINGS</h1>
      <h3 className="text-xl mb-6">Manage your profile & security</h3>

      {/* PROFILE CARD */}
      <section className="relative w-[95%] md:w-full max-w-250 space-y-6 bg-background/50 p-8 rounded-2xl">
        {/* Sign Out Button - Desktop only: top-right absolute */}
        <button
          onClick={signOut}
          className="hidden md:block absolute top-6 right-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 transition-opacity hover:opacity-90 z-10"
        >
          Sign Out
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-400 bg-background/30">
            {imagePreview ? (
              <Image src={imagePreview} alt="Profile" fill className="object-cover" />
            ) : (
              <span className="flex items-center justify-center h-full text-gray-400">No Image</span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold capitalize">{user.name}</h2>
            <p className="opacity-70 mt-2">{user.bio || "No bio provided."}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionButton onClick={() => setActiveModal("profile")}>Edit Profile</ActionButton>
          <ActionButton onClick={() => setActiveModal("password")}>Change Password</ActionButton>
          <ActionButton onClick={() => setActiveModal("security")}>Security Settings</ActionButton>
          {/* Sign Out - Visible only on mobile, full width below the others */}
          <button
            onClick={signOut}
            className="md:hidden col-span-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold py-3 transition-opacity hover:opacity-90"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* CIRCLES MANAGEMENT */}
      <section className="w-[95%] md:w-full max-w-250 space-y-6 bg-background/50 p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-gradient text-left">Your Circles</h2>

        {user.circles.length === 0 ? (
          <p className="text-left opacity-70">You are not part of any circles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.circles.map((circle) => (
              <div key={circle.id} className="flex items-center gap-4 bg-background/30 p-4 rounded-xl">
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={circle.image || "/placeholder-circle.png"}
                    alt={circle.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold capitalize">{circle.name}</h3>
                  <p className="text-sm opacity-70 line-clamp-2">{circle.description}</p>
                  <p className="text-xs mt-1 opacity-50">Role: {circle.role}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {circle.role === "owner" ? (
                    <>
                      <ActionButton
                        onClick={() => {
                          setSelectedCircle(circle);
                          setImagePreview(circle.image);
                          setImageFile(null);
                          setActiveModal("editCircle");
                        }}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => {
                          setSelectedCircle(circle);
                          setActiveModal("deleteCircle");
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </ActionButton>
                    </>
                  ) : (
                    <ActionButton
                      onClick={() => handleLeaveCircle(circle.id)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Leave
                    </ActionButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODALS */}
      {activeModal && (
        <Modal onClose={() => {
          setActiveModal(null);
          setSelectedCircle(null);
          setImagePreview(user.image);
          setImageFile(null);
        }}>
          {/* PROFILE */}
          {activeModal === "profile" && (
            <FormWrapper title="Edit Profile" onSubmit={(f) => submit(f, "user")} loading={loading}>
              <Field label="Name" error={errors.name}>
                <input name="name" defaultValue={user.name} className="input" />
              </Field>
              <Field label="Bio" error={errors.bio}>
                <textarea name="bio" defaultValue={user.bio} rows={4} className="textarea" />
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

          {/* PASSWORD & SECURITY */}
          {activeModal === "password" && (
            <FormWrapper title="Change Password" onSubmit={(f) => submit(f, "user")} loading={loading}>
              <SecurityGate errors={errors} />
              <input name="password" type="password" placeholder="New password" className="input" />
              <input name="confirmPassword" type="password" placeholder="Confirm password" className="input" />
            </FormWrapper>
          )}

          {activeModal === "security" && (
            <FormWrapper title="Security Settings" onSubmit={(f) => submit(f, "user")} loading={loading}>
              <SecurityGate errors={errors} />
              <Field label="Security Question 1">
                <select name="securityQuestionOne" defaultValue={user.securityQuestionOne} className="input">
                  {securityQuestionsSetOne.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </Field>
              <Field label="Answer 1" error={errors.securityAnswerOne}>
                <input name="securityAnswerOne" placeholder="New answer" className="input" />
              </Field>
              <Field label="Security Question 2">
                <select name="securityQuestionTwo" defaultValue={user.securityQuestionTwo} className="input">
                  {securityQuestionsSetTwo.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </Field>
              <Field label="Answer 2" error={errors.securityAnswerTwo}>
                <input name="securityAnswerTwo" placeholder="New answer" className="input" />
              </Field>
            </FormWrapper>
          )}

          {/* EDIT CIRCLE */}
          {activeModal === "editCircle" && selectedCircle && (
            <FormWrapper title="Edit Circle" onSubmit={(f) => submit(f, "circle")} loading={loading}>
              <input type="hidden" name="circleId" value={selectedCircle.id} />

              <Field label="Name" error={errors.name}>
                <input name="name" defaultValue={selectedCircle.name} className="input" />
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  name="description"
                  defaultValue={selectedCircle.description}
                  rows={4}
                  className="textarea"
                />
              </Field>

              <Field label={`Tags (${selectedCircle.tags.length}/12)`} error={errors.tags}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const tag = selectedCircle.tags[i];
                    return (
                      <input
                        key={i}
                        name="tags"
                        defaultValue={tag || ""}
                        placeholder={`Tag ${i + 1}`}
                        className="input"
                      />
                    );
                  })}
                </div>
                {errors.tags && <p className="text-red-500 text-xs mt-2">{errors.tags}</p>}
              </Field>

              <Field label="Circle Image">
                <div
                  className="relative w-full h-48 border-2 border-dashed border-gray-400 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer bg-background/30"
                  onClick={() => document.getElementById("circleImageInput")?.click()}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <span className="text-gray-400">Click to upload new image</span>
                  )}
                  <input
                    id="circleImageInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </div>
              </Field>
            </FormWrapper>
          )}

          {/* DELETE CIRCLE */}
          {activeModal === "deleteCircle" && selectedCircle && (
            <FormWrapper title="Delete Circle" onSubmit={(f) => submit(f, "circle")} loading={loading}>
              <input type="hidden" name="circleId" value={selectedCircle.id} />
              <p className="text-left text-red-400 font-medium">
                Warning: This action is permanent and cannot be undone.
              </p>
              <p className="text-left mt-4">
                To confirm deletion, type the circle name exactly:{" "}
                <strong className="font-bold">{selectedCircle.name}</strong>
              </p>
              <Field label="Circle Name" error={errors.confirmationName}>
                <input name="confirmationName" placeholder={selectedCircle.name} className="input outline-none" />
              </Field>
            </FormWrapper>
          )}
        </Modal>
      )}
    </main>
  );
}

/* ===================== UI HELPERS ===================== */

function ActionButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-lg bg-gradient font-bold py-2 px-4 hover:opacity-90 text-sm ${className || ""}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-8">
      <div className="w-full max-w-2xl max-h-screen bg-background/90 p-8 md:rounded-2xl relative overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-2xl opacity-60 hover:opacity-100 z-10"
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
      className="flex flex-col space-y-8"
    >
      <h2 className="text-3xl font-bold text-gradient">{title}</h2>
      <div className="space-y-6">{children}</div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gradient font-bold py-3 hover:opacity-90 w-full mt-4"
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
      <label className="font-medium mb-2 text-lg">
        {label}
        {error && <span className="text-red-500 text-sm ml-2">({error})</span>}
      </label>
      {children}
      <hr className="h-0.5 w-full bg-gradient mt-3 opacity-50" />
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