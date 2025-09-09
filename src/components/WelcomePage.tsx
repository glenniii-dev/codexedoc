"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function WelcomePage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen}>
          <DialogContent className="sm:max-w-lg md:max-w-2xl xl:max-w-4xl p-8" showCloseButton={false}>
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-center font-bold lg:pb-5">Welcome To CODEXEDOC</DialogTitle>
          <DialogDescription className="text-md lg:text-lg xl:text-xl text-center lg:pb-5">
            Share as you CODE · EXECUTE · DOCUMENT. CODEXEDOC is the place where developers of all levels come together to create, learn, and connect through code. Whether you’re building your first project or refining advanced ideas, this is your space to showcase your work, collaborate with others, and discover new approaches. More than just a platform for snippets, CODEXEDOC is about sharing the full journey of creating with code — from the first line to the finished project.
          </DialogDescription>
          <div className="flex items-center gap-2 justify-center flex-col lg:flex-row" onClick={() => setIsOpen(false)}>
              <SignInButton mode="modal">
                <Button variant="default" className="w-full lg:ml-8 lg:max-w-xs xl:max-w-sm">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default" className="w-full lg:mr-8 lg:max-w-xs xl:max-w-sm">Sign Up</Button>
              </SignUpButton>
          </div>
      </DialogContent>
    </Dialog>
  )
}
