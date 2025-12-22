import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw'; 
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeContent = String(children).replace(/\n$/, '');
  
  return !inline && match ? (
    <div className="relative group my-8 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{match[1]}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(codeContent)}
          className="text-xs text-slate-500 hover:text-teal-400 transition-colors"
        >
          Copy Code
        </button>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '0.9rem' }}
        {...props}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-slate-800/50 text-teal-300 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-700/50" {...props}>
      {children}
    </code>
  );
};

export const RenderBlock = ({ block }) => {
  if (block.type === 'latex' || (block.text && block.text.startsWith('Latex:'))) {
    const mathContent = block.text.replace('Latex:', '').trim();
    return (
      <div className="my-10 overflow-x-auto py-6 px-4 bg-slate-900/20 rounded-xl border border-slate-800/50 flex justify-center items-center shadow-inner">
        <BlockMath math={mathContent} />
      </div>
    );
  }

  if (block.type === 'heading') {
    const level = block.level || 2;
    const Tag = `h${level}`;
    const id = block.text.toLowerCase().replace(/[^\w]+/g, '-');
    const sizes = { 2: 'text-3xl mt-16', 3: 'text-2xl mt-12', 4: 'text-xl mt-8' };

    return (
      <Tag id={id} className={`scroll-mt-32 font-bold text-white mb-6 tracking-tight relative group ${sizes[level]}`}>
        <a href={`#${id}`} className="absolute -left-6 text-teal-500/0 group-hover:text-teal-500/50 transition-all no-underline">#</a>
        {block.text}
      </Tag>
    );
  }

  if (block.type === 'code') {
    return <CodeBlock className={`language-${block.language || 'python'}`}>{block.text}</CodeBlock>;
  }

  if (block.type === 'paragraph') {
    return (
      <div className="mb-8 text-lg text-slate-300 leading-relaxed prose prose-invert max-w-none 
                      prose-strong:text-white prose-strong:font-bold 
                      prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
                      prose-ul:list-disc prose-ol:list-decimal">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]} 
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            code: CodeBlock,
            a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />,
          }}
        >
          {block.text}
        </ReactMarkdown>
      </div>
    );
  }

  return null;
};