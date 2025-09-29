"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { usePathname, useRouter } from "next/navigation";

// import { updateUser } from "@/lib/actions/user.actions";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";
import { Textarea } from "../ui/textarea";
import { sanitizeText } from "@/lib/utils";
import toast from "react-hot-toast";
// import { createThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
  const router = useRouter();
    const pathname = usePathname();
    
    const form = useForm({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
        thread: ''
      },
    });
  
    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
      const sanitized = sanitizeText(values.thread || '');
      if (sanitized.hasProfanity) {
        toast("Profanity was filtered from your comment");
      }
      await addCommentToThread(threadId, sanitized.cleaned, JSON.parse(currentUserId), pathname);
  
      // Reset the form so the user can comment again
      form.reset();
    }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col gap-4 border-y border-y-neutral-900 py-5"
      >
        <div className="flex items-start gap-3 w-full max-xs:flex-col">
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 w-full">
                <FormLabel>
                  <Image
                    src={currentUserImg}
                    alt="Profile Image"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Comment..."
                    className="no-focus border-none bg-neutral-950 text-white focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="self-end bg-neutral-900 hover:bg-neutral-950 rounded-md px-8 py-2 text-sm text-white max-xs:w-full"
        >
          Reply
        </Button>
      </form>
    </Form>
  )
}

export default Comment;