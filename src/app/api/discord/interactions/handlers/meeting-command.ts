import { NextResponse } from "next/server";

/**
 * /scheduler meeting → 回傳 Modal（type: 9）
 */
export function handleMeetingCommand() {
  return NextResponse.json({
    type: 9, // MODAL
    data: {
      custom_id: "scheduler_meeting_modal",
      title: "建立會議排程",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_name",
              label: "會議名稱",
              style: 1,
              placeholder: "例如：GDG 週會",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_participants",
              label: "預計參與人數",
              style: 1,
              placeholder: "例如：10",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_date_range",
              label: "日期範圍（起始 ~ 結束）",
              style: 1,
              placeholder: "例如：2025-01-20 ~ 2025-01-25",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_description",
              label: "會議描述（選填）",
              style: 2,
              placeholder: "會議議程或備註...",
              required: false,
            },
          ],
        },
      ],
    },
  });
}
