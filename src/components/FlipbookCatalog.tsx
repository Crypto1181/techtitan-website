import { useState, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Maximize2, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface FlipbookCatalogProps {
  pages?: string[];
  title?: string;
}

// Sample catalog pages - replace with actual catalog images
const defaultPages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=800&fit=crop',
];

// Page component for the flipbook
const Page = ({ pageNumber, image }: { pageNumber: number; image: string }) => {
  return (
    <div className="w-full h-full bg-white shadow-lg overflow-hidden relative">
      <img
        src={image}
        alt={`Catalog page ${pageNumber}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Page {pageNumber}
      </div>
    </div>
  );
};

const FlipbookCatalog = ({ pages = defaultPages, title = 'Product Catalog' }: FlipbookCatalogProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bookRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const totalPages = pages.length;

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const goToPrevPage = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const goToNextPage = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  // Mobile: Single page view with swipe
  const MobileFlipbook = () => (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[320px] aspect-[3/4] mx-auto">
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef}
          width={320}
          height={420}
          size="stretch"
          minWidth={280}
          maxWidth={320}
          minHeight={370}
          maxHeight={420}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={500}
          usePortrait={true}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.3}
          showPageCorners={true}
          disableFlipByClick={false}
          swipeDistance={20}
          clickEventForward={true}
          useMouseEvents={true}
        >
          {pages.map((page, index) => (
            <div key={index} className="page-content">
              <Page pageNumber={index + 1} image={page} />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Mobile Controls */}
      <div className="flex items-center gap-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        <span className="text-sm text-muted-foreground px-3">
          {currentPage + 1} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Swipe left or right to flip pages
      </p>
    </div>
  );

  // Desktop: Double page spread view
  const DesktopFlipbook = ({ width, height }: { width: number; height: number }) => (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef}
          width={width / 2}
          height={height}
          size="stretch"
          minWidth={200}
          maxWidth={450}
          minHeight={300}
          maxHeight={600}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={false}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          swipeDistance={30}
          clickEventForward={true}
          useMouseEvents={true}
        >
          {pages.map((page, index) => (
            <div key={index} className="page-content">
              <Page pageNumber={index + 1} image={page} />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Desktop Controls */}
      <div className="flex items-center gap-4 mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <span className="text-sm text-muted-foreground min-w-[100px] text-center">
          Page {currentPage + 1} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {!isFullscreen && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-12 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-accent/20">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {isMobile 
              ? 'Tap edges or swipe to flip pages' 
              : 'Click or drag to flip pages • Click fullscreen for larger view'
            }
          </p>
        </div>

        {/* Flipbook */}
        <div className="flex justify-center">
          {isMobile ? (
            <MobileFlipbook />
          ) : (
            <DesktopFlipbook width={700} height={450} />
          )}
        </div>

        {/* Fullscreen dialog - Desktop only */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-8">
            <DialogTitle className="sr-only">{title} - Fullscreen View</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex items-center justify-center h-full">
              <DesktopFlipbook width={1000} height={650} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default FlipbookCatalog;
