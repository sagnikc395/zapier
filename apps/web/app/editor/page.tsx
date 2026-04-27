"use client";
import MainSection from "../../components/MainSection";
import PublishZap from "../../components/PublishZap";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function EditorContent() {
  const searchParams = useSearchParams();
  const zapId: String | null = searchParams.get("zapId");

  return (
    <MainSection>
      <div className="min-h-[92vh] relative canvas w-full flex flex-col">
        <PublishZap zapId={zapId ?? ""} />
      </div>
    </MainSection>
  );
}

function Loading() {
  return (
    <MainSection>
      <div className="min-h-[92vh] relative canvas w-full flex flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    </MainSection>
  );
}

function page() {
  return (
    <Suspense fallback={<Loading />}>
      <EditorContent />
    </Suspense>
  );
}

export default page;
