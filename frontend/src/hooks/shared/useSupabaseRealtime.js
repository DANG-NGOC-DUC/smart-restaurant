import { useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

/**
 * Hook đăng ký Supabase Realtime trên nhiều bảng.
 * Khi có thay đổi ở bất kỳ bảng nào → gọi `onEvent` (thường là refetch).
 *
 * @param {string} channelName  - Tên channel duy nhất (vd: "staff-tables")
 * @param {Array<{ table: string, event?: string, filter?: string }>} subscriptions
 *   - table: tên bảng PostgreSQL
 *   - event: "INSERT" | "UPDATE" | "DELETE" | "*" (default "*")
 *   - filter: Supabase filter string, vd "status=eq.ready"
 * @param {Function} onEvent - Callback khi nhận event (payload) => void
 * @param {boolean} enabled - Bật/tắt subscription (default true)
 */
export function useSupabaseRealtime(
  channelName,
  subscriptions,
  onEvent,
  enabled = true,
) {
  // Dùng ref để tránh re-subscribe khi onEvent thay đổi reference
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !subscriptions || subscriptions.length === 0) return;

    const channel = supabase.channel(channelName);

    subscriptions.forEach(
      ({ table, event = "*", filter, schema = "public" }) => {
        const config = {
          event,
          schema,
          table,
        };
        if (filter) config.filter = filter;

        channel.on("postgres_changes", config, (payload) => {
          onEventRef.current(payload);
        });
      },
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, enabled]);
}
