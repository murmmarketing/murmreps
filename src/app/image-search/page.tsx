"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";

export default function ImageSearchPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setSubmitted(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSearch = () => {
    setSubmitted(true);
    window.open("https://s.1688.com/youyuan/index.htm", "_blank");
  };

  const clearImage = () => {
    setPreview(null);
    setFileName("");
    setSubmitted(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Header */}
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Image search{" "}
        <span className="text-accent">find any product.</span>
      </h1>
      <p className="mt-3 text-text-secondary">
        Upload a photo of any product and find it on 1688.com
      </p>

      {/* Upload zone */}
      <div className="mt-10">
        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex w-full flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-16 transition-colors ${
              dragging
                ? "border-accent bg-accent/5"
                : "border-accent/40 bg-[#141414] hover:border-accent hover:bg-accent/5"
            }`}
          >
            {/* Upload icon */}
            <svg
              className="mb-4 h-12 w-12 text-accent/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            <p className="text-sm font-medium text-white">
              Drag and drop an image, or click to select
            </p>
            <p className="mt-1 text-xs text-text-muted">
              JPG, PNG, or WEBP
            </p>
          </button>
        ) : (
          <div className="rounded-card border border-subtle bg-[#141414] p-6">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Upload preview"
                className="h-32 w-32 flex-shrink-0 rounded-btn object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {fileName}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Ready to search
                </p>
                <button
                  onClick={clearImage}
                  className="mt-3 text-xs font-medium text-text-muted transition-colors hover:text-danger"
                >
                  Remove
                </button>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Search on 1688
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Instructions after search */}
      {submitted && (
        <div className="mt-6 rounded-card border border-accent/20 bg-accent/5 p-5">
          <h3 className="font-heading text-sm font-semibold text-accent">
            How to search with your image
          </h3>
          <ol className="mt-3 flex flex-col gap-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                1
              </span>
              Click the camera icon in the 1688 search bar
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                2
              </span>
              Upload the image you just selected
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                3
              </span>
              Browse results and copy the product URL
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                4
              </span>
              Paste the URL in our{" "}
              <Link href="/converter" className="text-accent hover:underline">
                Link Converter
              </Link>{" "}
              to get agent buy links
            </li>
          </ol>

          <a
            href="https://s.1688.com/youyuan/index.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            Open 1688 Image Search &rarr;
          </a>
        </div>
      )}

      {/* Tips */}
      <div className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-white">
          Tips for better results
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              ),
              text: "Use clear, well-lit photos for best results",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
              ),
              text: "Product photos work better than outfit or lifestyle shots",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-6.364-6.364L4.757 8.25"
                />
              ),
              text: "Found a match? Copy the 1688 URL and use our Link Converter",
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              ),
              text: "Crop to just the product — remove background clutter",
            },
          ].map((tip, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-card border border-subtle bg-[#141414] p-4"
            >
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {tip.icon}
              </svg>
              <p className="text-sm text-text-secondary">{tip.text}</p>
            </div>
          ))}
        </div>

        {/* CTA to converter */}
        <div className="mt-8 rounded-card border border-accent/20 bg-accent/5 p-5 text-center">
          <p className="text-sm text-text-secondary">
            Already have a product link?
          </p>
          <Link
            href="/converter"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
          >
            Go to Link Converter &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
