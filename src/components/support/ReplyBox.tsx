"use client";

import { useState } from "react";

import { Form, Input } from "antd";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FileUpload } from "@/components/common/file-upload";
import { Button } from "@/components/ui/button";
import { useReplyTicket } from "@/hooks/api/use-support";
import { FILE_CATEGORY, type FilePublic } from "@/lib/types/file";
import { zodFieldRule } from "@/lib/validation/zodToAntdRule";
import { getReplySchema, type ReplyFormValues } from "@/schemas/support";

interface ReplyBoxProps {
  ticketId: string;
}

export function ReplyBox({ ticketId }: ReplyBoxProps) {
  const { t } = useTranslation(["support", "validation"]);
  const [form] = Form.useForm<ReplyFormValues>();
  const [files, setFiles] = useState<FilePublic[]>([]);
  const { mutate: reply, isPending } = useReplyTicket(ticketId);
  const schema = getReplySchema(t);

  const onFinish = (values: ReplyFormValues) => {
    reply(
      { body: values.body, attachment_file_ids: files.map((file) => file.id) },
      {
        onSuccess: () => {
          form.resetFields();
          setFiles([]);
        },
      },
    );
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
