"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCircle } from "@/server/mutations/create/createCircle";
import { FaX } from "react-icons/fa6";
import imageCompression from "browser-image-compression";
import Image from "next/image";

export default function CreateCirclePage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(["", "", ""]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressedBlob = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    });

    const compressedFile = new File([compressedBlob], file.name, { type: file.type });
    setImageFile(compressedFile);
    setImagePreview(URL.createObjectURL(compressedFile));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (imageFile) formData.set("image", imageFile);

    try {
      const result = await createCircle(formData);
      if (result?.success) router.push("/hub");
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof Error) {
        try {
          setErrors(JSON.parse(error.message));
        } catch {
          setErrors({ general: "Something went wrong. Please try again." });
        }
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center w-full text-center mx-auto p-4">
      <h1 className="text-5xl font-bold text-gradient mb-2">CREATE CIRCLE</h1>
      <h3 className="text-xl mb-6">Create a new circle for your community.</h3>

      <section className="flex flex-col w-full max-w-250 sm:bg-background/50 sm:p-8 sm:rounded-2xl space-y-6">
        <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
          {/* Circle Name */}
          <Field label="Circle Name" error={errors.name}>
            <input name="name" type="text" className="input" />
          </Field>

          {/* Image Upload */}
          <Field label="Image" error={errors.image}>
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

          {/* Description */}
          <Field label="Description" error={errors.description}>
            <textarea
              name="description"
              rows={4}
              className="textarea"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags (3–12)" error={errors.tags}>
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map((tag, i) => (
                <div key={i} className="flex items-center border rounded px-2 py-1 sm:bg-background/50">
                  <input
                    name="tags"
                    value={tag}
                    onChange={(e) => {
                      const newTags = [...tags];
                      newTags[i] = e.target.value;
                      setTags(newTags);
                    }}
                    placeholder={`Tag ${i + 1}`}
                    className="outline-none w-20 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => tags.length > 3 && setTags(tags.filter((_, idx) => idx !== i))}
                    className="ml-1 text-red-400 hover:text-red-500 disabled:opacity-50"
                    disabled={tags.length <= 3}
                  >
                    <FaX />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-gradient hover:underline"
                onClick={() => tags.length < 12 && setTags([...tags, ""])}
              >
                + Add Tag
              </button>
            </div>
          </Field>

          {/* Submit */}
          <button
            type="submit"
            className="rounded-lg bg-gradient font-bold py-2 hover:opacity-90 w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "CREATE CIRCLE"}
          </button>

          {errors.general && <p className="text-red-500 mt-2">{errors.general}</p>}
        </form>
      </section>
    </main>
  );
}

/* ===================== HELPERS ===================== */

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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