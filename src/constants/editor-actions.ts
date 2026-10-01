export const editorActionIds = ['bold', 'italic', 'heading2', 'heading3', 'heading4', 'heading5', 'blockquote', 'unorderedList', 'orderedList', 'strikethrough', 'underline', 'undo', 'redo'] as const;
export type EditorActionId = typeof editorActionIds[number];
export const defaultEditorActions: EditorActionId[] = ['bold', 'italic', 'heading2', 'blockquote', 'unorderedList', 'orderedList', 'strikethrough'];
export const editorActionLabels: Record<EditorActionId, string> = {
  bold: '加粗', italic: '斜体', heading2: '二级标题', heading3: '三级标题', heading4: '四级标题', heading5: '五级标题',
  blockquote: '引用', unorderedList: '项目列表', orderedList: '编号列表', strikethrough: '删除线', underline: '下划线', undo: '撤销', redo: '重做',
};
