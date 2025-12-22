import type { MDXEditorMethods, SandpackPreset } from '@mdxeditor/editor';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertImage,
  InsertSandpack,
  InsertTable,
  InsertThematicBreak,
  imagePlugin,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  markdownShortcutPlugin,
  quotePlugin,
  Separator,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor';
import type React from 'react';
import { useRef } from 'react';
import useTheme from '@/hooks/use-theme';

import '@mdxeditor/editor/style.css';
import { CODE_LANGUAGES } from '@/constants/code-languages.constant';
import { SANDPACK_PRESETS } from '@/constants/sandpack-presets.constant';

interface MarkdownEditorProps {
  markdownRef?: React.RefObject<MDXEditorMethods>;
  content: string;
  readonly?: boolean;
  hideToolbar?: boolean;
  className?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function MarkdownEditor({
  markdownRef: externalRef,
  content,
  onChange,
  readonly = false,
  hideToolbar = false,
  className = '',
  placeholder = 'Write your markdown content here...',
  onImageUpload,
}: MarkdownEditorProps) {
  const { theme } = useTheme();
  const internalRef = useRef<MDXEditorMethods>(null);
  const editorRef = externalRef ?? internalRef;

  const createPlugins = (markdown: string) => {
    const corePlugins = [
      listsPlugin(),
      quotePlugin(),
      headingsPlugin(),
      tablePlugin(),
      thematicBreakPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      imagePlugin({
        imageUploadHandler: async (file) => {
          if (onImageUpload) {
            return await onImageUpload(file);
          }
          return URL.createObjectURL(file);
        },
      }),
      codeBlockPlugin({
        defaultCodeBlockLanguage: 'js',
      }),
      frontmatterPlugin(),
      sandpackPlugin({
        sandpackConfig: {
          defaultPreset: 'react',
          presets: SANDPACK_PRESETS as SandpackPreset[],
        },
      }),
      codeMirrorPlugin({
        codeBlockLanguages: CODE_LANGUAGES,
      }),
      diffSourcePlugin({ diffMarkdown: markdown }),
      markdownShortcutPlugin(),
    ];

    const toolbar = toolbarPlugin({
      toolbarContents: () => (
        <div className='flex flex-wrap gap-1 border-b p-1'>
          <UndoRedo />
          <Separator />
          <BoldItalicUnderlineToggles />
          <Separator />
          <BlockTypeSelect />
          <Separator />
          <CreateLink />
          <InsertImage />
          <InsertTable />
          <Separator />
          <ListsToggle />
          <CodeToggle />
          <InsertCodeBlock />
          <Separator />
          <InsertThematicBreak />
          <InsertFrontmatter />
          <Separator />
          <InsertSandpack />
        </div>
      ),
    });

    return hideToolbar ? corePlugins : [toolbar, ...corePlugins];
  };

  const themeClass = theme === 'dark' ? 'dark-theme dark-editor' : '';
  const contentEditableClass = 'prose dark:prose-invert max-w-none';

  return (
    <div className={`prose max-w-none ${className}`}>
      <MDXEditor
        ref={editorRef}
        readOnly={readonly}
        className={themeClass}
        markdown={content}
        onChange={onChange}
        placeholder={placeholder}
        plugins={createPlugins(content)}
        contentEditableClassName={contentEditableClass}
      />
    </div>
  );
}

export default MarkdownEditor;
