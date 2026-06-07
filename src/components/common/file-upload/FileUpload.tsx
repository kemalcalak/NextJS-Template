"use client";

import { useEffect, useState } from "react";

import { Upload } from "antd";
import { Paperclip, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useUploadFile } from "@/hooks/api/use-files";
import { toast } from "@/lib/toast";
import type { FileCategory, FilePublic } from "@/lib/types/file";

import {
  DEFAULT_IMAGE_TYPES,
  DEFAULT_MAX_UPLOAD_SIZE,
  formatBytes,
  validateFile,
} from "./file-upload-utils";

import type { UploadFile, UploadProps } from "antd";

interface FileUploadProps {
  value?: FilePublic[];
  onChange?: (files: FilePublic[]) => void;
  // Cap the number of files; pass 1 for a single avatar. Undefined = unlimited.
  maxCount?: number;
  readOnly?: boolean;
  disabled?: boolean;
  // MIME whitelist. Defaults to images (the only type the backend accepts
  // today); pass video/* etc. once the backend supports them — the upload,
  // validation and progress logic here is already type-agnostic.
  allowedTypes?: readonly string[];
  maxSizeBytes?: number;
  className?: string;
  // Cloudinary bucket the upload is tagged with. Defaults to "general"
  // server-side; pass "support_attachment" for ticket attachments.
  category?: FileCategory;
  // "tiles" (default): large picture-circle tiles, e.g. the avatar uploader.
  // "compact": a small paperclip trigger + a slim file list, for inline use in
  // a chat composer where the big tile would dominate.
  variant?: "tiles" | "compact";
}

const toUploadFile = (file: FilePublic): UploadFile => ({
  uid: file.id,
  name: file.filename ?? file.id,
  status: "done",
  url: file.url,
});

export function FileUpload({
  value = [],
  onChange,
  maxCount,
  readOnly = false,
  disabled = false,
  allowedTypes = DEFAULT_IMAGE_TYPES,
  maxSizeBytes = DEFAULT_MAX_UPLOAD_SIZE,
  className,
  category,
  variant = "tiles",
}: FileUploadProps) {
  const { t } = useTranslation("upload");
  const upload = useUploadFile();
  const [fileList, setFileList] = useState<UploadFile[]>(() => value.map(toUploadFile));

  // Re-sync the visible list only when the external file set actually changes
  // (keyed on ids), so an in-flight upload's progress isn't wiped on re-render.
  const valueKey = value.map((file) => file.id).join(",");
  useEffect(() => {
    setFileList(value.map(toUploadFile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey]);

  const beforeUpload: NonNullable<UploadProps["beforeUpload"]> = (file) => {
    const validationError = validateFile(file, allowedTypes, maxSizeBytes);
    if (validationError) {
      toast.error(t(`errors.${validationError}`, { size: formatBytes(maxSizeBytes) }));
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: NonNullable<UploadProps["customRequest"]> = ({
    file,
    onProgress,
    onSuccess,
    onError,
  }) => {
    if (!(file instanceof File)) return;
    upload.mutate(
      { file, category, onProgress: (percent) => onProgress?.({ percent }) },
      {
        onSuccess: (uploaded) => onSuccess?.(uploaded),
        onError: (err) => onError?.(err instanceof Error ? err : new Error(String(err))),
      },
    );
  };

  const handleChange: NonNullable<UploadProps["onChange"]> = (info) => {
    setFileList(info.fileList);
    // Notify the parent only once every file has settled (none uploading).
    if (info.fileList.some((file) => file.status === "uploading")) return;
    const files = info.fileList
      .filter((file) => file.status === "done")
      .map(
        (file) => (file.response as FilePublic | undefined) ?? value.find((v) => v.id === file.uid),
      )
      .filter((file): file is FilePublic => Boolean(file));
    onChange?.(files);
  };

  const canAddMore = maxCount === undefined || fileList.length < maxCount;
  const isCompact = variant === "compact";

  return (
    <Upload
      className={className}
      listType={isCompact ? "picture" : "picture-circle"}
      fileList={fileList}
      accept={allowedTypes.join(",")}
      disabled={disabled || readOnly}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onChange={handleChange}
      showUploadList={{ showRemoveIcon: !readOnly, showPreviewIcon: true }}
    >
      {!readOnly &&
        canAddMore &&
        (isCompact ? (
          <Button type="button" variant="ghost" disabled={disabled || readOnly}>
            <Paperclip className="h-4 w-4" />
            {t("upload")}
          </Button>
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <Plus className="size-5" />
            {t("upload")}
          </span>
        ))}
    </Upload>
  );
}
