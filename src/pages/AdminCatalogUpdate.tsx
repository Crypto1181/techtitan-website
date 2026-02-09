import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { fetchSettings, updateSetting } from '@/services/expressBackend';
import { toast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

const AdminCatalogUpdate = () => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        if (settings.catalog_url) {
          setCurrentUrl(settings.catalog_url);
          setNewUrl(settings.catalog_url);
        }
        if (settings.catalog_subtitle) {
          setCurrentSubtitle(settings.catalog_subtitle);
          setNewSubtitle(settings.catalog_subtitle);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
        toast({
          title: "Error",
          description: "Failed to load current settings",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveUrl = async () => {
    setIsLoading(true);
    try {
      if (newUrl && newUrl !== currentUrl) {
        await updateSetting('catalog_url', newUrl);
        setCurrentUrl(newUrl);
      }
      
      if (newSubtitle !== currentSubtitle) {
        await updateSetting('catalog_subtitle', newSubtitle);
        setCurrentSubtitle(newSubtitle);
      }

      toast({
        title: "Success",
        description: "Catalog settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update catalog settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = (newUrl && newUrl !== currentUrl) || (newSubtitle !== currentSubtitle);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => {}}
        activeTab="admin"
        onTabChange={() => {}}
      />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Product Catalog Settings</CardTitle>
                    <CardDescription>
                        Update the PDF file URL or link for the digital flipbook catalog displayed on the website.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current-url">Current Catalog URL</Label>
                        <div className="p-3 bg-secondary/50 rounded-md text-sm font-mono break-all">
                            {isFetching ? (
                                <span className="flex items-center text-muted-foreground">
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                currentUrl || 'No URL set'
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-url">New Catalog URL or Filename</Label>
                        <Input
                            id="new-url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://example.com/catalog.pdf OR catalog.pdf"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter a full URL, or just the filename (e.g., 'catalog.pdf') if uploaded to the configured GitHub repository.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-subtitle">Catalog Subtitle</Label>
                        <Input
                            id="new-subtitle"
                            value={newSubtitle}
                            onChange={(e) => setNewSubtitle(e.target.value)}
                            placeholder="e.g. Peripherals - October 2025"
                        />
                        <p className="text-xs text-muted-foreground">
                           Optional subtitle to display below the main title.
                        </p>
                    </div>

                    <Button 
                        onClick={handleSaveUrl} 
                        disabled={isLoading || isFetching || !hasChanges}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Catalog
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminCatalogUpdate;
