import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-500 lowercase">{match[1]}</span>
        <div className="flex gap-1.5">
           <div className="w-2.5 h-2.5 rounded-full bg-slate-700/50" />
           <div className="w-2.5 h-2.5 rounded-full bg-slate-700/50" />
        </div>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-slate-800 text-teal-300 px-1 py-0.5 rounded font-mono text-sm" {...props}>
      {children}
    </code>
  );
};

export const RenderBlock = ({ block }) => {
  // 1. Handle "Latex:" Prefix Block
  if (block.text && block.text.startsWith('Latex:')) {
    const mathContent = block.text.replace('Latex:', '').trim();
    return (
      <div className="my-8 overflow-x-auto py-4 px-2 bg-slate-900/30 rounded-lg border border-slate-800/50 flex justify-center">
        <BlockMath math={mathContent} />
      </div>
    );
  }

  // 2. Handle Headings
  if (block.type === 'heading') {
    const id = block.text.toLowerCase().replace(/[^\w]+/g, '-');
    return (
      <h2 id={id} className="scroll-mt-32 text-2xl md:text-3xl font-bold text-white mt-16 mb-6 tracking-tight relative group">
        <a href={`#${id}`} className="absolute -left-6 md:-left-8 text-teal-500/0 group-hover:text-teal-500/50 transition-all text-xl no-underline">#</a>
        {block.text}
      </h2>
    );
  }

  // 3. Handle Code Blocks (defined by type="code")
  if (block.type === 'code') {
     return (
       <CodeBlock className={`language-${block.language || 'python'}`}>
         {block.text}
       </CodeBlock>
     );
  }

  // 4. Handle Standard Paragraphs (Markdown + Math + Newlines)
  if (block.type === 'paragraph') {
    return (
      <div className="mb-6 text-lg text-slate-300 leading-8 prose prose-invert max-w-none prose-p:leading-8 prose-strong:text-white prose-strong:font-bold prose-headings:text-white prose-a:text-teal-400 hover:prose-a:text-teal-300">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkBreaks]} // remarkBreaks fixes the \n issue
          rehypePlugins={[rehypeKatex]}
          components={{
            code: CodeBlock,
            a: ({node, ...props}) => (
              <a target="_blank" rel="noopener noreferrer" {...props} />
            ),
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-slate-300" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 text-slate-300" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-500 pl-4 py-1 my-6 bg-slate-900/50 italic text-slate-400" {...props} />
          }}
        >
          {block.text}
        </ReactMarkdown>
      </div>
    );
  }

  return null;
};