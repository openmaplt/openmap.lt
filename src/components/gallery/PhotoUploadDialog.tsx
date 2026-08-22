"use client";

import { ImagePlus, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPhotoAction, type UploadedPhoto } from "@/actions/photos";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  PHOTO_LICENSE_INFO,
  PHOTO_LICENSE_ORDER,
  PHOTO_LICENSES,
  type PhotoLicense,
} from "@/config/photoLicenses";
import { PHOTO_STATUS } from "@/domain/photoStatus";

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SHOW_AUTHOR_STORAGE_KEY = "openmap:photoShowAuthor";

interface PhotoUploadDialogProps {
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  onUploaded: (uploaded: UploadedPhoto[]) => void;
}

export function PhotoUploadDialog({
  mapProfileId,
  objectRef,
  poiName,
  onUploaded,
}: PhotoUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [license, setLicense] = useState<PhotoLicense>(PHOTO_LICENSES.CC_BY);
  const [showAuthor, setShowAuthor] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(SHOW_AUTHOR_STORAGE_KEY);
    if (stored !== null) setShowAuthor(stored === "true");
  }, []);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [files]);

  const resetState = () => {
    setFiles([]);
    setLicense(PHOTO_LICENSES.CC_BY);
    setError(null);
  };

  const addFiles = (incoming: FileList | File[]) => {
    const imageFiles = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/"),
    );
    setFiles((current) => [...current, ...imageFiles].slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Pasirinkite bent vieną nuotrauką.");
      return;
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
      setError("Kiekviena nuotrauka turi būti iki 10MB.");
      return;
    }

    setSubmitting(true);
    setError(null);

    window.localStorage.setItem(SHOW_AUTHOR_STORAGE_KEY, String(showAuthor));

    const formData = new FormData();
    formData.set("mapProfileId", mapProfileId);
    formData.set("objectRef", objectRef);
    formData.set("poiName", poiName ?? "");
    formData.set("license", license);
    formData.set("showAuthor", String(showAuthor));
    for (const file of files) formData.append("files", file);

    const result = await createPhotoAction(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(
        {
          rate_limited:
            "Per daug bandymų per trumpą laiką, pabandykite vėliau.",
          no_session: "Reikia prisijungti.",
          invalid_profile: "Nepavyko nustatyti objekto.",
          invalid_ref: "Nepavyko nustatyti objekto.",
          invalid_license: "Neteisinga licencija.",
          no_files: "Pasirinkite bent vieną nuotrauką.",
          too_many_files: `Per daug failų (maks. ${MAX_FILES}).`,
          file_too_large: "Kiekviena nuotrauka turi būti iki 10MB.",
        }[result.error],
      );
      return;
    }

    if (result.uploaded.length > 0) {
      const anyPending = result.uploaded.some(
        (p) => p.status === PHOTO_STATUS.PENDING,
      );
      const anyResized = result.uploaded.some((p) => p.wasResized);
      let message =
        result.uploaded.length === 1
          ? "Nuotrauka įkelta."
          : `${result.uploaded.length} nuotraukos įkeltos.`;
      if (anyPending) message += " Laukia patvirtinimo.";
      if (anyResized) message += " Nuotraukos dydis sumažintas iki 2000px.";
      toast.success(message);
      onUploaded(result.uploaded);
    }
    if (result.failedFormatCount > 0) {
      toast.error(
        `${result.failedFormatCount} failas(-ai) nepalaikomo formato — praleista.`,
      );
    }

    if (
      result.uploaded.length > 0 ||
      result.failedFormatCount === files.length
    ) {
      setOpen(false);
      resetState();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <ImagePlus className="size-4" />
          Įkelti nuotrauką
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Įkelti nuotrauką</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((url, i) => (
                <div key={url} className="relative aspect-square">
                  {/* biome-ignore lint/performance/noImgElement: local blob preview, not a served asset */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Upload className="size-5" />
            Vilkite nuotraukas čia arba spustelėkite pasirinkti
          </button>

          <div className="space-y-2">
            <Label htmlFor="license-select" className="text-sm font-medium">
              Licencija
            </Label>
            <Select
              value={license}
              onValueChange={(value) => setLicense(value as PhotoLicense)}
            >
              <SelectTrigger id="license-select">
                <SelectValue>{PHOTO_LICENSE_INFO[license].label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PHOTO_LICENSE_ORDER.map((value) => {
                  const info = PHOTO_LICENSE_INFO[value];
                  return (
                    <SelectItem key={value} value={value}>
                      <span>{info.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {info.description}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <a
              href={PHOTO_LICENSE_INFO[license].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Peržiūrėti licencijos „{PHOTO_LICENSE_INFO[license].label}"
              sąlygas
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-author"
              checked={showAuthor}
              onCheckedChange={(checked) => setShowAuthor(checked === true)}
            />
            <Label htmlFor="show-author" className="font-normal">
              Prie nuotraukos rodyti mano naudotojo vardą
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={submitting || files.length === 0}
            onClick={handleSubmit}
          >
            {submitting ? "Įkeliama..." : "Įkelti"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
