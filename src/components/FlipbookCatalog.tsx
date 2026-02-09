import { useState, useEffect } from 'react';
import { Maximize2, X, BookOpen, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import PdfFlipbook from '@/components/PdfFlipbook';
import { fetchSettings, API_BASE_URL } from '@/services/expressBackend';

interface FlipbookCatalogProps {
  title?: string;
  subtitle?: string;
  catalogUrl?: string;
}

const FlipbookCatalog = ({
  title = 'Product Catalog',
  subtitle: initialSubtitle,
  catalogUrl: initialCatalogUrl = '/catalogs/peripherals-october-2025.pdf'
}: FlipbookCatalogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Use the proxy endpoint by default, so we can support private GitHub repos
  const [catalogUrl, setCatalogUrl] = useState(`${API_BASE_URL}/settings/catalog-file`);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        // If settings has a specific URL, we still use the proxy to handle it (e.g. if it's GitHub)
        // But if it's a local file path, the proxy handles redirect.
        // So we just keep using the proxy endpoint.
        
        // Exception: If the user hasn't set ANYTHING in DB, we might want to fallback to initialCatalogUrl
        if (!settings.catalog_url) {
           setCatalogUrl(initialCatalogUrl);
        } else {
           // We use the proxy URL with a timestamp to prevent caching if the backend file changes
           setCatalogUrl(`${API_BASE_URL}/settings/catalog-file?t=${Date.now()}`);
        }

        if (settings.catalog_subtitle) {
          setSubtitle(settings.catalog_subtitle);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
        // Fallback
        setCatalogUrl(initialCatalogUrl);
      }
    };
    loadSettings();
  }, [initialCatalogUrl]);

  const isPdf = /\.pdf(\?.*)?$/i.test(catalogUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = catalogUrl;
    link.download = 'Product-Catalog.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          {subtitle && (
            <p className="text-muted-foreground text-sm md:text-base mb-2">
              {subtitle}
            </p>
          )}
          <p className="text-muted-foreground text-sm md:text-base">
            {isMobile
              ? 'Tap the catalog to view in fullscreen • Browse our interactive product catalog'
              : 'Browse our interactive product catalog • Click fullscreen for a better viewing experience'
            }
          </p>
        </div>

        {/* Catalog Viewer */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-7xl catalog-iframe-wrapper"
            style={{
              aspectRatio: isMobile ? '16/9' : '16/10',
              height: isMobile ? '400px' : '800px',
              minHeight: isMobile ? '400px' : '800px'
            }}
          >
            {isPdf ? (
              <div
                className="w-full h-full rounded-lg shadow-2xl bg-background"
                style={{
                  height: isMobile ? '400px' : '800px',
                  minHeight: isMobile ? '400px' : '800px',
                  pointerEvents: isMobile ? 'none' : 'auto'
                }}
              >
                <PdfFlipbook src={catalogUrl} className="h-full w-full" />
              </div>
            ) : (
              <iframe
                src={catalogUrl}
                className="w-full h-full border-0 rounded-lg shadow-2xl catalog-iframe"
                allowFullScreen
                allow="fullscreen"
                title={title}
                style={{
                  height: isMobile ? '400px' : '800px',
                  minHeight: isMobile ? '400px' : '800px',
                  pointerEvents: isMobile ? 'none' : 'auto'
                }}
              />
            )}

            {/* Mobile tap-to-open overlay */}
            {isMobile && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg cursor-pointer"
                onClick={() => setIsFullscreen(true)}
                style={{ touchAction: 'pan-y' }}
              >
                <div className="bg-background/90 dark:bg-card/90 px-4 py-2 rounded-lg border border-border shadow-lg">
                  <p className="text-sm font-medium text-foreground">Tap to view fullscreen</p>
                </div>
              </div>
            )}

            {/* Fullscreen Button */}
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(true)}
                className="bg-background/90 dark:bg-card/90 hover:bg-background dark:hover:bg-card border-border shadow-lg backdrop-blur-sm"
                title="Fullscreen"
              >
                <Maximize2 className="h-5 w-5 text-foreground" />
              </Button>
            </div>

            {/* Open in New Tab Button */}
            <div className="absolute top-4 right-16 z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(catalogUrl, '_blank', 'noopener,noreferrer')}
                className="bg-background/90 dark:bg-card/90 hover:bg-background dark:hover:bg-card border-border shadow-lg backdrop-blur-sm"
                title="Open in new tab"
              >
                <ExternalLink className="h-5 w-5 text-foreground" />
              </Button>
            </div>

            {/* Download Button (only for PDF) */}
            {isPdf && (
              <div className="absolute top-4 right-28 z-20">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  className="bg-background/90 dark:bg-card/90 hover:bg-background dark:hover:bg-card border-border shadow-lg backdrop-blur-sm"
                  title="Download PDF"
                >
                  <Download className="h-5 w-5 text-foreground" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Dialog */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-4">
            <DialogTitle className="sr-only">{title} - Fullscreen View</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/90 dark:bg-card/90 hover:bg-background dark:hover:bg-card border border-border shadow-lg backdrop-blur-sm"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6 text-foreground" />
            </Button>
            <div className="flex items-center justify-center h-full w-full">
              {isPdf ? (
                <PdfFlipbook src={catalogUrl} className="h-full w-full" />
              ) : (
                <iframe
                  src={catalogUrl}
                  className="w-full h-full border-0 rounded-lg"
                  allowFullScreen
                  allow="fullscreen"
                  title={`${title} - Fullscreen`}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default FlipbookCatalog;
