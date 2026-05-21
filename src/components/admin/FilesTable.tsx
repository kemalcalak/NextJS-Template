"use client";

import { Eye, FileIcon, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatBytes } from "@/components/common/file-upload/file-upload-utils";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import type { AdminFileListItem } from "@/lib/types/file";

interface FilesTableProps {
  rows: AdminFileListItem[];
  isLoading: boolean;
  onPreview: (file: AdminFileListItem) => void;
  onDelete: (file: AdminFileListItem) => void;
}

const isImage = (contentType: string) => contentType.startsWith("image/");

export function FilesTable({ rows, isLoading, onPreview, onDelete }: FilesTableProps) {
  const { t } = useTranslation("admin");

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("files.columns.file")}</th>
            <th className="px-4 py-3">{t("files.columns.type")}</th>
            <th className="px-4 py-3">{t("files.columns.size")}</th>
            <th className="px-4 py-3">{t("files.columns.uploadedBy")}</th>
            <th className="px-4 py-3">{t("files.columns.created")}</th>
            <th className="px-4 py-3 text-right">{t("files.columns.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((file) => {
            const image = isImage(file.content_type);
            return (
              <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {image ? (
                      <button
                        type="button"
                        onClick={() => {
                          onPreview(file);
                        }}
                        aria-label={t("files.rowActions.preview")}
                        className="size-10 shrink-0 overflow-hidden rounded-md border border-border"
                      >
                        <img src={file.url} alt="" className="size-full object-cover" />
                      </button>
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                        <FileIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {file.filename ?? t("files.unnamed")}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {file.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone="muted">{file.content_type}</StatusBadge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {file.uploaded_by_id ? file.uploaded_by_id.slice(0, 8) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(file.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!image}
                      aria-label={t("files.rowActions.preview")}
                      onClick={() => {
                        onPreview(file);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("files.rowActions.delete")}
                      onClick={() => {
                        onDelete(file);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {isLoading ? t("files.loading") : t("files.empty")}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
