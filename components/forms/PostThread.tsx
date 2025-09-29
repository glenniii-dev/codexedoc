"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";

// import { updateUser } from "@/lib/actions/user.actions";
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

export default function PostThread({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();
  
  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accountId: userId
    },
  });

  const [wasFiltered, setWasFiltered] = useState(false);
  const [cleanedText, setCleanedText] = useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    const filter = new Filter();
    filter.addWords('BADWORD101')
    const cleaned = filter.clean(values.thread || "");

    const wasCleaned = cleaned !== (values.thread || "");

    // If content was cleaned, pause submission and show a warning so the user
    // can either accept the cleaned text or edit it.
    if (wasCleaned) {
      setCleanedText(cleaned);
      setWasFiltered(true);
      return;
    }

    await createThread({
      text: cleaned,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push('/');
  }

  const postCleaned = async () => {
    if (!cleanedText) return;

    await createThread({
      text: cleanedText,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push('/');
  }

  const editCleaned = () => {
    if (!cleanedText) return;
    // populate the form with the cleaned text so user can make edits
    form.setValue('thread', cleanedText);
    setWasFiltered(false);
    setCleanedText(null);
  }

  return (
    <Form {...form}>
      <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-neutral-200 text-lg font-semibold">
                Content
              </FormLabel>
              <FormControl className="border-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 bg-neutral-900 text-white">
                <Textarea
                  className="min-h-60"
                  placeholder="Share what you have been coding, executing, and documenting!"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-neutral-900 hover:bg-neutral-950">
            Post Thread
          </Button>
          {wasFiltered && (
            <div className="mt-4 p-4 bg-[#670000] border border-[#C60C30] text-[#C60C30] rounded font-bold">
              <p className="mb-2">We detected language that may be inappropriate and have cleaned it for you.</p>
              <div className="flex gap-3">
                <Button onClick={postCleaned} className="bg-[#C60C30] hover:bg-[#6c0000] text-white font-base">Post cleaned text</Button>
                <Button onClick={editCleaned} variant="outline">Edit text</Button>
              </div>
            </div>
          )}
      </form>
    </Form>
  )
}
