export default function RightSidebar() {
  return (
    <section className="scrollbar-hidden sticky right-0 top-0 z-20 flex h-screen w-fit flex-col justify-between gap-12 overflow-auto bg-neutral-950 px-10 pb-6 pt-28 max-xl:hidden">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-xl text-white font-medium">Suggested Communities</h3>
      </div>
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-xl text-white font-medium">Suggested Users</h3>
      </div>
    </section>
  )
}
