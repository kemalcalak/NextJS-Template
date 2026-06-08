"use client";

import { useState } from "react";

import { Form, Input, Modal } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { FileUpload } from "@/components/common/file-upload";
import { Button } from "@/components/ui/button";
import { useCreateTicket } from "@/hooks/api/use-support";
import { getLocaleFromPath, getLocalizedPath, ROUTES } from "@/lib/config/routes";
import { FILE_CATEGORY, type FilePublic } from "@/lib/types/file";
import { zodFieldRule } from "@/lib/validation/zodToAntdRule";
import { getCreateTicketSchema, type CreateTicketFormValues } from "@/schemas/support";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTicketModal({ open, onOpenChange }: NewTicketModalProps) {
  const { t } = useTranslation(["support", "validation"]);
  const [form] = Form.useForm<CreateTicketFormValues>();
  const [files, setFiles] = useState<FilePublic[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: createTicket, isPending } = useCreateTicket();
  const schema = getCreateTicketSchema(t);

  const close = () => {
    if (isPending) return;
    form.resetFields();
    setFiles([]);
    onOpenChange(false);
  };

  const onFinish = (values: CreateTicketFormValues) => {
    createTicket(
      {
        subject: values.subject,
        body: values.body,
        attachment_file_ids: files.map((file) => file.id),
      },
      {
        onSuccess: (response) => {
          form.resetFields();
          setFiles([]);
          onOpenChange(false);
          router.push(
            getLocalizedPath(
              `${ROUTES.support}/${response.ticket.id}`,
              getLocaleFromPath(pathname),
            ),
          );
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      title={t("new.title")}
      centered
      width={520}
      destroyOnHidden
      onCancel={close}
      mask={{ closable: !isPending }}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="mt-4">
        <Form.Item
          name="subject"
          label={t("new.subjectLabel")}
          rules={[zodFieldRule(schema.shape.subject)]}
        >
          <Input placeholder={t("new.subjectPlaceholder")} maxLength={200} disabled={isPending} />
        </Form.Item>

        <Form.Item name="body" label={t("new.bodyLabel")} rules={[zodFieldRule(schema.shape.body)]}>
          <Input.TextArea
            rows={5}
            placeholder={t("new.bodyPlaceholder")}
            maxLength={10000}
            disabled={isPending}
          />
        </Form.Item>

        <Form.Item label={t("new.attachments")}>
          <FileUpload
            value={files}
            onChange={setFiles}
            category={FILE_CATEGORY.SUPPORT_ATTACHMENT}
            disabled={isPending}
          />
        </Form.Item>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={close} disabled={isPending}>
            {t("new.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("new.submit")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
