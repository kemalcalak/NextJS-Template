"use client";

import { useState } from "react";

import { Form, Input } from "antd";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FileUpload } from "@/components/common/file-upload";
import { Button } from "@/components/ui/button";
import { FILE_CATEGORY, type FilePublic } from "@/lib/types/file";
import type { MessageCreatePayload } from "@/lib/types/support";
import { zodFieldRule } from "@/lib/validation/zodToAntdRule";
import { getReplySchema, type ReplyFormValues } from "@/schemas/support";

interface ReplyBoxProps {
  // The parent owns the mutation (user vs admin reply endpoint); ReplyBox just
  // collects the draft and resets once the submit resolves.
  onSubmit: (payload: MessageCreatePayload) => Promise<unknown>;
  isPending: boolean;
}

export function ReplyBox({ onSubmit, isPending }: ReplyBoxProps) {
  const { t } = useTranslation(["support", "validation"]);
  const [form] = Form.useForm<ReplyFormValues>();
  const [files, setFiles] = useState<FilePublic[]>([]);
  const schema = getReplySchema(t);

  const onFinish = (values: ReplyFormValues) => {
    void onSubmit({ body: values.body, attachment_file_ids: files.map((file) => file.id) })
      .then(() => {
        form.resetFields();
        setFiles([]);
      })
      .catch(() => {
        // The global toast surfaces the error; keep the draft for a retry.
      });
  };

  return (
    <Form form={form} onFinish={onFinish} className="space-y-3">
      <Form.Item name="body" rules={[zodFieldRule(schema.shape.body)]} className="mb-0">
        <Input.TextArea
          rows={3}
          placeholder={t("detail.replyPlaceholder")}
          maxLength={10000}
          disabled={isPending}
        />
      </Form.Item>
      <div className="flex items-center justify-between gap-3">
        <FileUpload
          value={files}
          onChange={setFiles}
          category={FILE_CATEGORY.SUPPORT_ATTACHMENT}
          disabled={isPending}
        />
        <Button type="submit" loading={isPending}>
          <Send className="h-4 w-4" />
          {t("detail.send")}
        </Button>
      </div>
    </Form>
  );
}
