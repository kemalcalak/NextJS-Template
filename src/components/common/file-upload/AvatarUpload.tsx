"use client";

import { useRef, useState } from "react";

import { Image } from "antd";
import { Eye, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useUploadFile } from "@/hooks/api/use-files";
import { toast } from "@/lib/toast";
import type { FilePublic } from "@/lib/types/file";
import { cn } from "@/lib/utils";

import {
  DEFAULT_IMAGE_TYPES,
  DEFAULT_MAX_UPLOAD_SIZE,
  formatBytes,
  validateFile,
} from "./file-upload-utils";

interface AvatarUploadProps {
  value?: FilePublic | null;
  onChange?: (file: FilePublic | null) => void;
  allowedTypes?: readonly string[];
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  allowedTypes = DEFAULT_IMAGE_TYPES,
  maxSizeBytes = DEFAULT_MAX_UPLOAD_SIZE,
  disabled = false,
  className,
}: AvatarUploadProps) {
  const { t } = useTranslation("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const upload = useUploadFile();

  const interactive = !disabled && !upload.isPending;

  const openPicker = () => {
    if (interactive) inputRef.current?.click();
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const validationError = validateFile(file, allowedTypes, maxSizeBytes);
    if (validationError) {
      toast.error(t(`errors.${validationError}`, { size: formatBytes(maxSizeBytes) }));
      return;
    }
    setProgress(0);
    upload.mutate(
      { file, onProgress: setProgress },
      {
        onSuccess: (uploaded) => {
          onChange?.(uploaded);
        },
        onSettled: () => {
          setProgress(0);
        },
      },
    );
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative size-28">
        {value?.url ? (
          <button
            type="button"
            onClick={() => {
              setPreviewOpen(true);
            }}
            disabled={upload.isPending}
            aria-label={t("preview")}
            className="size-28 overflow-hidden rounded-full border border-border"
          >
            <img src={value.url} alt="" className="size-full object-cover" />
          </button>
        ) : (
          <div className="flex size-28 items-center justify-center rounded-full border border-border bg-muted">
            <ImageIcon className="size-9 text-muted-foreground" />
          </div>
        )}
        {upload.isPending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/50 text-xs font-medium text-white">
            <Loader2 className="size-5 animate-spin" />
            {progress > 0 ? `${progress}%` : null}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {value && (
          <Button
            variant="secondary"
            onClick={() => {
              setPreviewOpen(true);
            }}
            disabled={upload.isPending}
          >
            <Eye className="size-4" />
            {t("preview")}
          </Button>
        )}
        <Button variant="outline" onClick={openPicker} disabled={!interactive}>
          <Upload className="size-4" />
          {value ? t("replace") : t("upload")}
        </Button>
        {value && (
          <Button
            variant="destructive"
            onClick={() => {
              onChange?.(null);
            }}
            disabled={!interactive}
          >
            <Trash2 className="size-4" />
            {t("remove")}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t("imageHint", { size: formatBytes(maxSizeBytes) })}
      </p>

      {value?.url && (
        <Image
          src={value.url}
          alt=""
          style={{ display: "none" }}
          preview={{ open: previewOpen, onOpenChange: setPreviewOpen }}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(",")}
        className="hidden"
        disabled={!interactive}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
