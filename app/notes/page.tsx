import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import Button from "@/components/Button";

export default function Page() {
  return (
    <>
      <SimpleEditor />
      <Button text="Save" className='my-3 mx-auto w-full ' full={false} />
    </>
  )
}
