import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  FileJson,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

interface ImportPageProps {
  onSignOut?: () => void;
}

interface ParsedHistoryItem {
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

interface FileStats {
  name: string;
  size: number;
  itemCount: number;
  validItems: ParsedHistoryItem[];
  errors: string[];
}

export function ImportPage({ onSignOut }: ImportPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileStats[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
  } | null>(null);

  const importMutation = trpc.importHistory.useMutation({
    onSuccess: (data) => {
      setImportResult({ success: true, imported: data.imported, errors: [] });
      setIsImporting(false);
    },
    onError: (error) => {
      setImportResult({
        success: false,
        imported: 0,
        errors: [error.message],
      });
      setIsImporting(false);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parseFile = async (file: File): Promise<FileStats> => {
    const stats: FileStats = {
      name: file.name,
      size: file.size,
      itemCount: 0,
      validItems: [],
      errors: [],
    };

    try {
      const text = await file.text();
      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        stats.errors.push("Invalid JSON format");
        return stats;
      }

      const items = Array.isArray(data) ? data : [data];
      stats.itemCount = items.length;

      for (let i = 0; i < items.length; i++) {
        const item = items[i] as Record<string, unknown>;
        const requiredFields = ["timelineTime", "type", "contentId", "content"];
        const missingFields = requiredFields.filter((f) => !item[f]);

        if (missingFields.length > 0) {
          stats.errors.push(
            `Item ${i + 1}: Missing fields: ${missingFields.join(", ")}`,
          );
          continue;
        }

        const parsedItem: ParsedHistoryItem = {
          timelineTime: String(item.timelineTime),
          type: String(item.type),
          contentId: String(item.contentId),
          content: item.content as Record<string, unknown>,
          searchContent: item.searchContent
            ? String(item.searchContent)
            : undefined,
        };

        stats.validItems.push(parsedItem);
      }
    } catch {
      stats.errors.push("Failed to read file");
    }

    return stats;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const jsonFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith(".json") || f.type === "application/json",
    );

    if (jsonFiles.length === 0) {
      return;
    }

    const newFiles = await Promise.all(jsonFiles.map(parseFile));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const jsonFiles = selectedFiles.filter(
      (f) => f.name.endsWith(".json") || f.type === "application/json",
    );

    if (jsonFiles.length === 0) {
      return;
    }

    const newFiles = await Promise.all(jsonFiles.map(parseFile));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    const allValidItems = files.flatMap((f) => f.validItems);
    if (allValidItems.length === 0) {
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    importMutation.mutate(allValidItems);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalItems = files.reduce((acc, f) => acc + f.validItems.length, 0);
  const totalErrors = files.reduce((acc, f) => acc + f.errors.length, 0);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🕵️</span>
              <span className="font-heading text-2xl text-foreground">
                Import History
              </span>
            </div>
          </div>
          {onSignOut && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </Button>
          )}
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {importResult && (
            <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardContent className="p-6">
                {importResult.success ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl text-foreground">
                        Import Successful
                      </h3>
                      <p className="text-muted-foreground">
                        Successfully imported {importResult.imported} items
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl text-foreground">
                        Import Failed
                      </h3>
                      <p className="text-muted-foreground">
                        {importResult.errors[0] || "Unknown error occurred"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground">
                Upload History Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
                  ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/50"
                  }
                `}
              >
                <input
                  type="file"
                  accept=".json,application/json"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isDragging ? "bg-primary/20" : "bg-primary/10"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 ${
                        isDragging ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Drag & drop JSON files here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports JSON files with history data
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">
                      Selected Files ({files.length})
                    </h3>
                    <div className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {totalItems} valid items
                      </span>
                      {totalErrors > 0 && (
                        <span className="text-red-500">
                          {totalErrors} errors
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg bg-accent/30"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileJson className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.validItems.length} items</span>
                            {file.errors.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-red-500">
                                  {file.errors.length} errors
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 rounded hover:bg-accent"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={isImporting || totalItems === 0}
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import {totalItems} Items
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">
                Expected Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-accent/30 p-4 rounded-lg text-xs text-muted-foreground overflow-auto">
                {`[
  {
    "timelineTime": "2024-01-15T10:30:00Z",
    "type": "bookmark",
    "contentId": "unique-id-123",
    "content": {
      "title": "Page Title",
      "url": "https://example.com",
      "description": "Page description"
    },
    "searchContent": "search terms"
  }
]`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
