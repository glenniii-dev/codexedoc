"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";

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

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    
    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push('/');
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
      </form>
    </Form>
  )
}
