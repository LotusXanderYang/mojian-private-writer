import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Note } from '@/types/note';
import { normalizeRichText } from '@/lib/rich-text';

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function noteHtml(note: Note): string {
  const title = escapeHtml(note.title.trim() || '未命名文稿');
  return `<article><h1>${title}</h1>${normalizeRichText(note.body)}</article>`;
}

function documentHtml(notes: Note[]): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/><style>
  @page{margin:22mm 18mm}body{color:#211F1B;font-family:serif;font-size:12pt;line-height:1.8}
  article{page-break-after:always}article:last-of-type{page-break-after:auto}h1{font-size:25pt;line-height:1.25;margin:0 0 20pt}h2{font-size:18pt;margin:20pt 0 8pt}h3{font-size:15pt;margin:16pt 0 6pt}h4{font-size:13pt;margin:14pt 0 5pt}h5{font-size:12pt;margin:12pt 0 4pt}
  p{margin:0 0 10pt}blockquote{border-left:3px solid #8B2D2B;color:#5F5A50;margin:12pt 0;padding-left:12pt}
  ul,ol{padding-left:22pt}li{margin:3pt 0}strong{font-weight:700}em{font-style:italic}img{display:block;max-width:100%;height:auto;margin:10pt 0}
  footer{border-top:1px solid #DDD3C3;color:#817A6E;font-size:9pt;margin-top:28pt;padding-top:8pt}
  </style></head><body>${notes.map(noteHtml).join('')}<footer>由墨笺在设备本地导出</footer></body></html>`;
}

function safeFileName(title: string): string {
  return title.trim().replace(/[\\/:*?"<>|]/g, '-').slice(0, 48) || '未命名文稿';
}

async function shareFile(uri: string, mimeType: string, dialogTitle: string, uti?: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('当前设备无法打开系统分享面板');
  await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI: uti });
}

export async function exportPdf(note: Note): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: documentHtml([note]) });
  const file = new File(uri);
  try {
    await shareFile(uri, 'application/pdf', '导出 PDF', 'com.adobe.pdf');
  } finally {
    if (file.exists) file.delete();
  }
}

export async function exportWord(note: Note): Promise<void> {
  const file = new File(Paths.cache, `${safeFileName(note.title)}.doc`);
  file.create({ overwrite: true, intermediates: true });
  file.write(`\ufeff${documentHtml([note])}`);
  try {
    await shareFile(file.uri, 'application/msword', '导出 Word 文档', 'com.microsoft.word.doc');
  } finally {
    if (file.exists) file.delete();
  }
}

function batchFileName(): string {
  const day = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replaceAll('/', '-');
  return `墨笺-批量导出-${day}`;
}

export async function exportPdfMany(notes: Note[]): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: documentHtml(notes) });
  const file = new File(uri);
  try { await shareFile(uri, 'application/pdf', `导出 ${notes.length} 篇文稿`, 'com.adobe.pdf'); }
  finally { if (file.exists) file.delete(); }
}

export async function exportWordMany(notes: Note[]): Promise<void> {
  const file = new File(Paths.cache, `${batchFileName()}.doc`);
  file.create({ overwrite: true, intermediates: true });
  file.write(`\ufeff${documentHtml(notes)}`);
  try { await shareFile(file.uri, 'application/msword', `导出 ${notes.length} 篇文稿`, 'com.microsoft.word.doc'); }
  finally { if (file.exists) file.delete(); }
}

export async function shareJpg(uri: string): Promise<void> {
  await shareFile(uri, 'image/jpeg', '导出 JPG 图片', 'public.jpeg');
}

