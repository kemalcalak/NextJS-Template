"use client";

import { useEffect } from "react";

import { Form, Select } from "antd";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminUsers } from "@/hooks/api/use-admin";
import { useUpdateAdminTicket } from "@/hooks/api/use-support";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type AdminTicketDetail,
  type AdminTicketUpdatePayload,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/types/support";
import { SystemRole } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";

interface ControlsFormValues {
  status: TicketStatus;
  priority: TicketPriority;
  // "" represents unassigned (antd Select can't bind a null value to an option).
  assigned_admin_id: string;
}

export function TicketAdminControls({ ticket }: { ticket: AdminTicketDetail }) {
  const { t } = useTranslation("support");
  const [form] = Form.useForm<ControlsFormValues>();
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const { mutate: update, isPending } = useUpdateAdminTicket(ticket.id);
  const { data: admins } = useAdminUsers({ role: SystemRole.ADMIN, limit: 100 });

  // Re-seed the form whenever the ticket's server state changes (e.g. a
  // realtime update or another admin's edit).
  useEffect(() => {
    form.setFieldsValue({
      status: ticket.status,
      priority: ticket.priority,
      assigned_admin_id: ticket.assigned_admin_id ?? "",
    });
  }, [form, ticket.id, ticket.status, ticket.priority, ticket.assigned_admin_id]);

  const assigneeOptions = [
    { value: "", label: t("admin.unassigned") },
    ...(admins?.data ?? []).map((admin) => ({ value: admin.id, label: admin.email })),
  ];

  const onFinish = (values: ControlsFormValues) => {
    const payload: AdminTicketUpdatePayload = {
      status: values.status,
      priority: values.priority,
      assigned_admin_id: values.assigned_admin_id || null,
    };
    update(payload);
  };

  const assignToMe = () => {
    if (currentUserId) form.setFieldValue("assigned_admin_id", currentUserId);
  };

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base">{t("admin.controls.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          initialValues={{
            status: ticket.status,
            priority: ticket.priority,
            assigned_admin_id: ticket.assigned_admin_id ?? "",
          }}
        >
          <Form.Item name="status" label={t("admin.controls.status")}>
            <Select
              options={TICKET_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
            />
          </Form.Item>
          <Form.Item name="priority" label={t("admin.controls.priority")}>
            <Select
              options={TICKET_PRIORITIES.map((value) => ({ value, label: t(`priority.${value}`) }))}
            />
          </Form.Item>
          <Form.Item name="assigned_admin_id" label={t("admin.assignee")}>
            <Select options={assigneeOptions} />
          </Form.Item>
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" onClick={assignToMe}>
              {t("admin.assignToMe")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("admin.controls.save")}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
