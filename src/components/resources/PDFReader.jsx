import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFReader({
  file,
  currentResource,
  allResources = [],
}) {
  const [numPages, setNumPages] =
    useState(null);

  const [pageNumber, setPageNumber] =
    useState(1);

  const [pageWidth, setPageWidth] =
    useState(1300);

  const currentIndex =
    allResources.findIndex(
      (item) =>
        item.slug === currentResource?.slug
    );

  const previousResource =
    currentIndex > 0
      ? allResources[currentIndex - 1]
      : null;

  const nextResource =
    currentIndex <
      allResources.length - 1 &&
    currentIndex !== -1
      ? allResources[currentIndex + 1]
      : null;

  function onDocumentLoadSuccess({
    numPages,
  }) {
    setNumPages(numPages);

    const savedPage =
      localStorage.getItem(
        `resource-progress-${file}`
      );

    if (savedPage) {
      setPageNumber(Number(savedPage));
    }
  }

  useEffect(() => {
    localStorage.setItem(
      `resource-progress-${file}`,
      pageNumber
    );
  }, [pageNumber, file]);

  useEffect(() => {
    function updateWidth() {
      const width =
        window.innerWidth > 1700
          ? 1500
          : window.innerWidth > 1400
          ? 1300
          : window.innerWidth > 1200
          ? 1100
          : window.innerWidth > 900
          ? 900
          : window.innerWidth - 60;

      setPageWidth(width);
    }

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () =>
      window.removeEventListener(
        "resize",
        updateWidth
      );
  }, []);

  const Controls = ({
    bottom = false,
  }) => (
    <div
      className="
        flex
        flex-wrap
        justify-between
        items-center
        gap-6
        px-6
        py-5
        bg-white
      "
    >
      {/* Page Controls */}

      <div
        className="
          flex
          items-center
          gap-4
        "
      >
        <button
          onClick={() =>
            setPageNumber((prev) =>
              Math.max(prev - 1, 1)
            )
          }
          disabled={pageNumber === 1}
          className="
            h-14
            w-14
            rounded-full
            bg-blue-600
            text-white
            text-3xl
            font-black
            shadow-lg
            transition-all
            duration-300
            hover:scale-110
            hover:bg-blue-500
            disabled:opacity-50
          "
        >
          ❮
        </button>

        <div
          className="
            px-6
            py-3
            rounded-full
            bg-blue-50
            text-blue-700
            font-semibold
            min-w-[170px]
            text-center
          "
        >
          Page {pageNumber}
          {numPages
            ? ` of ${numPages}`
            : ""}
        </div>

        <button
          onClick={() =>
            setPageNumber((prev) =>
              Math.min(
                prev + 1,
                numPages || prev
              )
            )
          }
          disabled={
            pageNumber === numPages
          }
          className="
            h-14
            w-14
            rounded-full
            bg-blue-600
            text-white
            text-3xl
            font-black
            shadow-lg
            transition-all
            duration-300
            hover:scale-110
            hover:bg-blue-500
            disabled:opacity-50
          "
        >
          ❯
        </button>
      </div>

      {/* Module Navigation */}

      <div>
        {!bottom &&
          previousResource && (
            <Link
              to={`/resources/${previousResource.slug}`}
              className="
                inline-flex
                items-center
                px-6
                py-3
                rounded-full
                bg-blue-600
                text-white
                font-semibold
                shadow-lg
                transition-all
                duration-300
                hover:bg-blue-500
                hover:scale-105
              "
            >
              ← Previous Module
            </Link>
          )}

        {bottom &&
          nextResource && (
            <Link
              to={`/resources/${nextResource.slug}`}
              className="
                inline-flex
                items-center
                px-6
                py-3
                rounded-full
                bg-blue-600
                text-white
                font-semibold
                shadow-lg
                transition-all
                duration-300
                hover:bg-blue-500
                hover:scale-105
              "
            >
              Next Module →
            </Link>
          )}
      </div>
    </div>
  );

  return (
    <div
      className="
        w-full
        rounded-3xl
        overflow-hidden
        border
        border-zinc-200
        bg-white
        shadow-xl
      "
    >
      {/* Top Controls */}

      <div
        className="
          sticky
          top-0
          z-30
          bg-white
          border-b
          border-zinc-200
        "
      >
        <Controls />
      </div>

      {/* PDF Area */}

      <div
        className="
          bg-white
          flex
          justify-center
          p-6
        "
      >
        <Document
          file={file}
          onLoadSuccess={
            onDocumentLoadSuccess
          }
          loading={
            <div
              className="
                py-20
                text-zinc-500
              "
            >
              Content PDF...
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* Bottom Controls */}

      <div
        className="
          border-t
          border-zinc-200
          bg-white
        "
      >
        <Controls bottom />
      </div>
    </div>
  );
}

export default PDFReader;