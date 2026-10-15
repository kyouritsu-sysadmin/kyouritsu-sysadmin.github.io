import React, { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import FlipbookReader from "./FlipbookReader";
import useLibraryLocale from "./useLibraryLocale";

export default function DocumentFile({
  path,
  title,
  pdf = false,
}: {
  path: string;
  title: string;
  pdf?: boolean;
}) {
  const url = useBaseUrl("/" + path);
  const { t } = useLibraryLocale();
  const [mode, setMode] = useState<"book" | "standard">("book");
  const [page, setPage] = useState(1);
  const reader = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!pdf || !reader.current) return;
    const element = reader.current;
    const controls = Array.from(
      element.querySelectorAll<HTMLElement>(
        ".reader-toolbar, .reader-modes, .flipbook-controls, .reader-hint",
      ),
    );
    const resize = () => {
      // On short/mobile screens, allow normal page scrolling instead of
      // letting wrapped controls squeeze the document area down to zero.
      const minimum = `${Math.ceil(
        controls.reduce(
          (height, control) => height + control.getBoundingClientRect().height,
          162,
        ),
      )}px`;
      if (element.style.getPropertyValue("--reader-min-height") !== minimum)
        element.style.setProperty("--reader-min-height", minimum);
    };
    resize();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(element.parentElement!);
    controls.forEach((control) => observer.observe(control));
    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [pdf, mode]);
  return (
    <section
      className={`file-reader${pdf ? " file-reader-pdf" : ""}`}
      ref={reader}
      aria-label={title}
    >
      <div className="reader-toolbar">
        <span className="reader-toolbar-title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 1.5h5.5L13 5v9.5H4z" />
            <path d="M9.5 1.5V5H13" />
          </svg>
          {t(pdf ? "PDF document" : "Document attachment")}
        </span>
        <div className="reader-actions">
          <a
            className="reader-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("Open file")}
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7.5 8.5" />
            </svg>
          </a>
          <a className="download-button" href={url} download>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 2.5v8m0 0 3-3m-3 3-3-3M3 13.5h10" />
            </svg>
            {t("Download")}
          </a>
        </div>
      </div>
      {pdf && (
        <>
          <div
            className="reader-modes"
            role="group"
            aria-label={t("PDF document")}
          >
            <button
              type="button"
              aria-pressed={mode === "book"}
              onClick={() => setMode("book")}
            >
              {t("Flipbook")}
            </button>
            <button
              type="button"
              aria-pressed={mode === "standard"}
              onClick={() => setMode("standard")}
            >
              {t("Standard PDF")}
            </button>
          </div>
          {mode === "book" ? (
            <FlipbookReader
              key={url}
              url={url}
              title={title}
              initialPage={page}
              onPageChange={setPage}
            />
          ) : (
            <iframe
              src={`${url}#page=${page}&view=Fit`}
              title={title}
              className="pdf-frame"
            />
          )}
          <p className="reader-hint">
            {t(
              mode === "book"
                ? "Use Standard PDF for text selection, search, and printing."
                : "If the preview is unavailable on your device, use Open file or Download above.",
            )}
          </p>
        </>
      )}
    </section>
  );
}
