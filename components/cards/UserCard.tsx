"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
}

export default function UserCard({ id, name, username, imgUrl, personType }: Props) {
  const router = useRouter();

  return (
    <article className="flex flex-row justify-between gap-4 max-xs:rounded-xl max-xs:bg-neutral-800 max-xs:p-4 xs:flex-row xs:items-center items-center">
      <div className="flex flex-1 items-start justify-start gap-3 xs:items-center">
        <Image
          src={imgUrl}
          alt="profile image"
          width={48}
          height={48}
          className="rounded-full"
          unoptimized
        />

        <div className="flex-1 text-ellipsis">
          <h4 className="text-base font-semibold text-white">{name}</h4>
          <p className="text-sm font-medium text-neutral-400">@{username}</p>
        </div>
      </div>
      <Button className="bg-neutral-900 hover:bg-neutral-950 rounded-md text-xs text-white h-8 w-20" onClick={() => router.push(`/profile/${id}`)}>
        View
      </Button>
    </article>
  )
}
