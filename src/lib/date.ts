export function formatRelativeTime(timestamp: number): string {
  const delta = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return '刚刚';
  if (delta < hour) return `${Math.floor(delta / minute)} 分钟前`;
  if (delta < day) return `${Math.floor(delta / hour)} 小时前`;
  if (delta < day * 2) return '昨天';
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

export function countWords(text: string): number {
  const chinese = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latin = text.replace(/[\u3400-\u9fff]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return chinese + latin;
}

