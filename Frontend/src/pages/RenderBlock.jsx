import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw'; 
import { BlockMath, InlineMath } from 'react-katex';
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

const normalizeBlogLink = (href) => {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  
  if (href.startsWith('/blog/')) {
    return `https://quantfinancewiki.com${href}`;
  }
  
  const slug = href.replace(/^\//, '');
  
  if (!href.includes('://') && !href.includes('.') && (href.includes('-') || href.includes('/'))) {
    if (slug.startsWith('blog/')) {
      return `https://quantfinancewiki.com/${slug}`;
    }
    return `https://quantfinancewiki.com/blog/${slug}`;
  }
  
  return href;
};

const LatexBlock = ({ content }) => (
  <div className="my-6 py-4 px-2 bg-slate-900/20 rounded-lg border border-slate-800/50 flex justify-center items-center shadow-inner overflow-x-auto">
    <div className="text-center">
      <BlockMath math={content} />
    </div>
  </div>
);

export const RenderBlock = ({ block }) => {
  if (block.type === 'latex' || (block.text && block.text.startsWith('Latex:'))) {
    const mathContent = block.text.replace('Latex:', '').trim();
    return <LatexBlock content={mathContent} />;
  }

  if (block.type === 'heading') {
    const level = block.level || 2;
    const Tag = `h${level}`;
    const id = block.text.toLowerCase().replace(/[^\w]+/g, '-');
    const sizes = { 
      1: 'text-4xl mt-20 mb-8', 
      2: 'text-3xl mt-16 mb-6', 
      3: 'text-2xl mt-12 mb-4', 
      4: 'text-xl mt-8 mb-3' 
    };

    return (
      <Tag 
        id={id} 
        className={`scroll-mt-32 font-bold text-white tracking-tight relative group ${sizes[level] || sizes[2]}`}
      >
        <a 
          href={`#${id}`} 
          className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-all duration-200 text-teal-500 no-underline md:-left-8"
        >
          #
        </a>
        {block.text}
      </Tag>
    );
  }

  if (block.type === 'code') {
    return <CodeBlock className={`language-${block.language || 'python'}`}>{block.text}</CodeBlock>;
  }

  if (block.type === 'paragraph') {
    const latexRegex = /\$\$([^$]+)\$\$/g;
    const text = block.text;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = latexRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      parts.push({
        type: 'latex',
        content: match[1].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
      return (
        <div className="mb-8 text-lg text-slate-300 leading-relaxed 
                      prose prose-invert max-w-none 
                      prose-strong:text-white prose-strong:font-bold 
                      prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
                      prose-ul:list-disc prose-ol:list-decimal
                      prose-p:my-4">
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]} 
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              code: CodeBlock,
              a: ({ node, href, ...props }) => {
                const normalizedHref = normalizeBlogLink(href);
                return (
                  <a 
                    href={normalizedHref} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                    {...props}
                  />
                );
              },
              math: ({ node, inline, ...props }) => 
                inline ? <InlineMath {...props} /> : <BlockMath {...props} />,
              'math-inline': ({ node, ...props }) => <InlineMath {...props} />,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      );
    }
    
    return (
      <div className="mb-8 text-lg text-slate-300 leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={index} className="my-4">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]} 
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                  components={{
                    code: CodeBlock,
                    a: ({ node, href, ...props }) => {
                      const normalizedHref = normalizeBlogLink(href);
                      return (
                        <a 
                          href={normalizedHref} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                          {...props}
                        />
                      );
                    },
                    math: ({ node, inline, ...props }) => 
                      inline ? <InlineMath {...props} /> : <BlockMath {...props} />,
                    'math-inline': ({ node, ...props }) => <InlineMath {...props} />,
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              </div>
            );
          } else {
            return <LatexBlock key={index} content={part.content} />;
          }
        })}
      </div>
    );
  }

  return null;
};