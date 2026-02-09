import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

type PdfFlipbookProps = {
  src: string;
  className?: string;
  /**
   * Hint for rendering quality. Higher values render sharper pages but use more CPU/memory.
   * Default aims for good quality without being too heavy.
   */
  renderScale?: number;
};

// Configure PDF.js worker
// In development, use local worker (Vite serves it correctly)
// In production, use CDN to avoid MIME type issues on hosting providers
const isDev = import.meta.env.DEV;
const CDN_WORKER_URLS = [
  'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs', // Fallback to older stable version
];

// Set initial worker - use local in dev, CDN in production
if (isDev) {
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  console.log('[PdfFlipbook] Using local worker (dev mode):', pdfWorkerUrl);
} else {
  GlobalWorkerOptions.workerSrc = CDN_WORKER_URLS[0];
  console.log('[PdfFlipbook] Using CDN worker (production):', CDN_WORKER_URLS[0]);
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

type PageProps = {
  pageNumber: number;
  imgSrc?: string;
  isLoading?: boolean;
};

const FlipPage = forwardRef<HTMLDivElement, PageProps>(({ pageNumber, imgSrc, isLoading }, ref) => {
  return (
    <div
      ref={ref}
      className="h-full w-full bg-background border border-border rounded-sm overflow-hidden flex items-center justify-center"
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={`Page ${pageNumber}`}
          className="h-full w-full object-contain select-none"
          draggable={false}
          loading="lazy"
        />
      ) : (
        <div className="text-sm text-muted-foreground px-4 text-center">
          {isLoading ? 'Rendering page…' : `Page ${pageNumber}`}
        </div>
      )}
    </div>
  );
});
FlipPage.displayName = 'FlipPage';

async function renderPageToDataUrl(pdf: PDFDocumentProxy, pageNumber: number, scale: number) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to create canvas context');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/webp', 0.92);
}

export default function PdfFlipbook({ src, className, renderScale = 1.75 }: PdfFlipbookProps) {
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [rendering, setRendering] = useState<Record<number, boolean>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPdf(null);
    setPageCount(0);
    setPageImages({});
    setRendering({});
    setCurrentPageIndex(0);

    (async () => {
      let lastError: any = null;
      
      // In dev mode, try local worker first, then CDN fallbacks
      // In production, try CDN URLs
      const workerUrlsToTry = isDev 
        ? [pdfWorkerUrl, ...CDN_WORKER_URLS]
        : CDN_WORKER_URLS;
      
      // Try each worker URL in sequence
      for (let i = 0; i < workerUrlsToTry.length; i++) {
        try {
          if (cancelled || !isMounted.current) return;
          
          const workerUrl = workerUrlsToTry[i];
          GlobalWorkerOptions.workerSrc = workerUrl;
          
          console.log(`[PdfFlipbook] Attempt ${i + 1}/${workerUrlsToTry.length}: Loading PDF from:`, src);
          console.log(`[PdfFlipbook] Using worker:`, workerUrl);
          
          const loadingTask = getDocument({
            url: src,
            withCredentials: false,
            httpHeaders: {},
          });
          
          const loadedPdf = await loadingTask.promise;
          
          if (cancelled || !isMounted.current) return;
          
          console.log('[PdfFlipbook] PDF loaded successfully, pages:', loadedPdf.numPages);
          setPdf(loadedPdf);
          setPageCount(loadedPdf.numPages);
          return; // Success, exit the loop
          
        } catch (error: any) {
          lastError = error;
          console.warn(`[PdfFlipbook] Attempt ${i + 1} failed:`, error?.message || error);
          
          // If this was the last attempt, log the final error
          if (i === workerUrlsToTry.length - 1) {
            console.error('[PdfFlipbook] All worker attempts failed. Final error:', error);
            console.error('[PdfFlipbook] PDF URL:', src);
            console.error('[PdfFlipbook] Tried workers:', workerUrlsToTry);
          }
          
          // Wait a bit before trying next worker
          if (i < workerUrlsToTry.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const pageNumbers = useMemo(() => Array.from({ length: pageCount }, (_, i) => i + 1), [pageCount]);

  useEffect(() => {
    if (!pdf || pageCount === 0) return;

    // Render a small window around the current page for a smooth flipping experience.
    const toRender = new Set<number>();
    const current = currentPageIndex + 1;

    // Always render the first few pages early (nice first impression).
    for (let p = 1; p <= Math.min(4, pageCount); p++) toRender.add(p);

    // Render current +/- 2.
    for (let p = Math.max(1, current - 2); p <= Math.min(pageCount, current + 2); p++) toRender.add(p);

    toRender.forEach((pageNumber) => {
      if (pageImages[pageNumber] || rendering[pageNumber]) return;

      setRendering((prev) => ({ ...prev, [pageNumber]: true }));
      renderPageToDataUrl(pdf, pageNumber, renderScale)
        .then((dataUrl) => {
          if (!isMounted.current) return;
          setPageImages((prev) => ({ ...prev, [pageNumber]: dataUrl }));
        })
        .finally(() => {
          if (!isMounted.current) return;
          setRendering((prev) => {
            const next = { ...prev };
            delete next[pageNumber];
            return next;
          });
        });
    });
  }, [pdf, pageCount, currentPageIndex, pageImages, rendering, renderScale]);

  // `react-pageflip` requires numeric width/height. We derive these from the container.
  // We use ~half width because the book shows 2 pages at once in landscape.
  const bookWidth = size.width > 0 ? Math.max(320, Math.floor(size.width / 2)) : 400;
  const bookHeight = size.height > 0 ? Math.max(240, size.height) : 600;

  return (
    <div ref={containerRef} className={className}>
      {pageCount === 0 ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-sm text-muted-foreground gap-2">
          <div>Loading catalog…</div>
          <div className="text-xs opacity-70">PDF: {src}</div>
        </div>
      ) : (
        <HTMLFlipBook
          width={bookWidth}
          height={bookHeight}
          size="stretch"
          minWidth={320}
          minHeight={240}
          maxShadowOpacity={0.2}
          showCover
          mobileScrollSupport
          onFlip={(e: any) => setCurrentPageIndex(e?.data ?? 0)}
          className="shadow-2xl"
        >
          {pageNumbers.map((pageNumber) => (
            <FlipPage
              key={pageNumber}
              pageNumber={pageNumber}
              imgSrc={pageImages[pageNumber]}
              isLoading={!!rendering[pageNumber]}
            />
          ))}
        </HTMLFlipBook>
      )}
    </div>
  );
}
