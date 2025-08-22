
'use client';

import { useState, useCallback, type DragEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, UploadCloud, Sparkles, Loader2, FileText, Calendar as CalendarIcon, FileImage, Sheet, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAiSuggestions } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { useDocuments } from '@/hooks/use-documents.tsx';
import type { Document } from '@/lib/types';


interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function UploadDialog({ isOpen, onOpenChange }: UploadDialogProps) {
  const { toast } = useToast();
  const { addDocument } = useDocuments();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Document['category'] | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date>();

  const resetState = useCallback(() => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setSuggestedTags([]);
    setIsSuggesting(false);
    setReminderDate(undefined);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSuggest = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to get tag suggestions.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const documentText = e.target?.result as string;
        const result = await getAiSuggestions({
          documentText: documentText.slice(0, 4000), // Truncate for performance
          documentTitle: title,
          documentDescription: description,
        });

        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Suggestion Failed',
            description: result.error,
          });
        } else {
          setSuggestedTags(result.tags);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not read the file content.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  const addSuggestedTag = (tagToAdd: string) => {
    if (!tags.includes(tagToAdd)) {
        setTags([...tags, tagToAdd]);
    }
    setSuggestedTags(suggestedTags.filter(tag => tag !== tagToAdd));
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const getFileIcon = (fileType: string): Document['icon'] => {
    if (fileType.includes('pdf')) return 'FileText';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Sheet';
    if (fileType.includes('image')) return 'FileImage';
    if (fileType.includes('document') || fileType.includes('word')) return 'FileSignature';
    return 'FileText';
  };

  const handleUpload = () => {
    if (!file || !title || !category) {
        toast({
            variant: 'destructive',
            title: 'Missing information',
            description: 'Please select a file, provide a title, and choose a category.',
        });
        return;
    }

    const newDocument = {
        title,
        description,
        category: category as Document['category'],
        tags,
        type: file.type.split('/')[1]?.toUpperCase() as Document['type'] || 'OTHER',
        icon: getFileIcon(file.type),
        reminderDate: reminderDate?.toISOString(),
    };

    addDocument(newDocument);
    toast({ title: 'Upload Successful!', description: `${file.name} has been added.` });
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Add a new file to your vault. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {!file ? (
                <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-200",
                        isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                >
                    <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="font-semibold">Drag & drop a file here</p>
                    <p className="text-sm text-muted-foreground">or</p>
                    <Button variant="link" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer text-primary">
                            browse your files
                        </label>
                    </Button>
                    <Input id="file-upload" type="file" className="absolute w-0 h-0 opacity-0" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
                </div>
            ) : (
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q4 Marketing Report" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of the document's content..." />
            </div>
            <div className="space-y-2">
                <Label>Set Reminder</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !reminderDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={reminderDate}
                            onSelect={setReminderDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as Document['category'])}>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-background/50 p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-accent/50 bg-accent/20 p-4">
               <div className="flex justify-between items-center">
                 <Label className="flex items-center gap-2 font-semibold text-accent-foreground">
                    <Sparkles className="h-4 w-4" />
                    Smart Tag Suggestions
                </Label>
                <Button variant="ghost" size="sm" onClick={handleSuggest} disabled={isSuggesting || !file}>
                    {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isSuggesting ? 'Thinking...' : 'Suggest'}
                </Button>
               </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestedTags.length > 0 ? (
                  suggestedTags.map((tag) => (
                    <Button key={tag} size="sm" variant="outline" className="bg-background" onClick={() => addSuggestedTag(tag)}>
                      {tag}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isSuggesting ? 'Generating suggestions...' : 'Click "Suggest" to get AI-powered tags based on the file content.'}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || !title || !category}>Upload File</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
