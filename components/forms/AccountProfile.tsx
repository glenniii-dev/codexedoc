"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";
import * as z from "zod";
import Image from "next/image";
import { ChangeEvent } from "react";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { sanitizeText } from "@/lib/utils";

type Props = {
  userId: string;
  objectId: string;
  username?: string;
  name: string;
  bio: string;
  image: string;
  btnTitle: string;
};

const AccountProfile = ({ userId, objectId, username, name, bio, image, btnTitle }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [buttonTitle, setButtonTitle] = useState(btnTitle);
  const { startUpload } = useUploadThing("media");
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: image || '',
      username: username || '',
      name: name || '',
      bio: bio || '',
    },
  })

  const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || '';

        // Only set base64 into the form if it's under the 1MB limit.
        // Sending large base64 strings to server actions can exceed Next's body size limit.
        if (file.size <= 1048576) {
          fieldChange(imageDataUrl);
        }
      }

      fileReader.readAsDataURL(file);
    }

    const file = e.target.files && e.target.files[0];
    if (file && file.size > 1048576) {
      // Notify the user and clear the selected file so we don't try to upload/send it.
      toast.error('Max file size is 1MB');
      // Clear controlled files state and the input value
      setFiles([]);
      // Clear the input element if possible
      try {
        const input = e.target as HTMLInputElement;
        input.value = '';
      } catch (e) {}
      return;
    }
  }

  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;

    const hasImageChanged = isBase64Image(blob);

    if (hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && imgRes[0].ufsUrl) {
      values.profile_photo = imgRes[0].ufsUrl;
      }
    }

    await updateUser({
      userId: userId,
      username: values.username,
      name: values.name,
      bio: values.bio,
      image: values.profile_photo,
      path: pathname
    });

    // Notify if profanity was filtered
    const nameSan = sanitizeText(values.name || '');
    const bioSan = sanitizeText(values.bio || '');
    if (nameSan.hasProfanity) toast("Profanity was filtered from your name");
    if (bioSan.hasProfanity) toast("Profanity was filtered from your bio");

    if (pathname === 'profile/edit') {
      router.back();
    } else {
      router.push('/');
    }
  }
  
  return (
    <Form {...form}>
      <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="flex h-15 w-15 items-center justify-center rounded-full bg-neutral-800">
                {field.value ? (
                  <Image 
                    src={field.value}
                    alt="profile photo"
                    width={96}
                    height={96}
                    priority
                    className="rounded-full object-contain"
                    unoptimized
                  />
                ) : (              
                    <Image 
                      src="/assets/profile.svg"
                      alt="profile photo"
                      width={24}
                      height={24}
                      className="object-contain"
                      unoptimized
                    />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-md text-neutral-400 border-none">
                <Input 
                  type="file"
                  accept="image/*"
                  placeholder="Upload a photo"
                  className="cursor-pointer bg-neutral-900 outline-none file:text-blue-400 placeholder:text-neutral-400 file:pr-2"
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-neutral-200 text-lg font-semibold">
                Name
              </FormLabel>
              <FormControl className="border-none">
                <Input 
                  type="text"
                  className="bg-neutral-800 text-white focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-neutral-200 text-lg font-semibold">
                Username
              </FormLabel>
              <FormControl className="border-none">
                <Input 
                  type="text"
                  className="bg-neutral-800 text-white focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-neutral-200 text-lg font-semibold">
                Bio
              </FormLabel>
              <FormControl className="border-none">
                <Textarea 
                  rows={10}
                  className="bg-neutral-800 text-white focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-neutral-700 hover:bg-neutral-800 font-semibold" onClick={
          () => setButtonTitle('Submitting...')     
        }
        >{buttonTitle}</Button>
      </form>
    </Form>
  )
};

export default AccountProfile;