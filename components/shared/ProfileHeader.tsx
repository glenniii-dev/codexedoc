import Image from "next/image";

interface Props {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
}

export default function ProfileHeader({ accountId, authUserId, name, username, imgUrl, bio }: Props) {
  return (
    <div className="flex w-full flex-col justify-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 object-cover">
            <Image
              src={imgUrl}
              alt="profile image"
              fill
              className="rounded-full object-cover shadow-2xl"
              unoptimized
            />
          </div>

          <div className="flex-1">
            <h2 className="text-left text-2xl font-bold text-white">{name}</h2>
            <p className="text-left text-sm text-neutral-400">@{username}</p>
          </div>
        </div>
      </div>

        {/* TODO: Community */}

        <p className="mt-6 max-w-lg text-left text-sm text-neutral-400">{bio}</p>

        <div className="mt-12 h-0.5 w-full bg-neutral-800" />
    </div>
  )
}
