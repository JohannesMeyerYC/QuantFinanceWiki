import React, { lazy, Suspense, useState, useEffect } from 'react';

// Lazy load ReactMarkdown and its plugins
const ReactMarkdown = lazy(() => import('react-markdown'));
const remarkMath = lazy(() => import('remark-math'));
const remarkBreaks = lazy(() => import('remark-breaks'));
const remarkGfm = lazy(() => import('remark-gfm'));
const rehypeKatex = lazy(() => import('rehype-katex'));
const rehypeRaw = lazy(() => import('rehype-raw'));

// Lazy load KaTeX and its CSS - this is the heavy math library
const katexLoader = lazy(() => 
  import('katex').then(katexModule => {
    // Import CSS separately to ensure it loads
    import('katex/dist/katex.min.css');
    return katexModule;
  })
);

// Lazy load react-katex components
const KatexComponents = lazy(() => 
  import('react-katex').then(mod => ({
    default: {
      BlockMath: mod.BlockMath,
      InlineMath: mod.InlineMath
    }
  }))
);

// Lazy load syntax highlighter and style
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(mod => ({
    default: mod.Prism || mod.default
  }))
);

const AtomDarkStyle = lazy(() =>
  import('react-syntax-highlighter/dist/esm/styles/prism').then(mod => ({
    default: mod.atomDark || mod.default
  }))
);

// Simple fallback components
const FallbackMath = ({ content, inline = false }) => {
  const [showLatex, setShowLatex] = useState(false);
  
  useEffect(() => {
    // Preload KaTeX on hover
    const preload = async () => {
      await import('katex');
      setShowLatex(true);
    };
    
    const timeout = setTimeout(preload, 100);
    return () => clearTimeout(timeout);
  }, []);
  
  if (!showLatex) {
    return (
      <span className="bg-slate-800/30 px-1 py-0.5 rounded text-sm italic text-slate-400">
        [Loading math formula...]
      </span>
    );
  }
  
  return (
    <Suspense fallback={
      <span className="bg-slate-800/30 px-1 py-0.5 rounded text-sm italic text-slate-400">
        [Loading math...]
      </span>
    }>
      {inline ? (
        <InlineMath math={content} />
      ) : (
        <BlockMath math={content} />
      )}
    </Suspense>
  );
};

// Lazy-loaded inline math component
const InlineMath = ({ math, ...props }) => {
  const [Component, setComponent] = useState(null);
  
  useEffect(() => {
    const loadComponent = async () => {
      const { InlineMath: MathComp } = await import('react-katex');
      setComponent(() => MathComp);
    };
    
    loadComponent();
  }, []);
  
  if (!Component) {
    return <FallbackMath content={math} inline />;
  }
  
  return <Component math={math} {...props} />;
};

// Lazy-loaded block math component
const BlockMath = ({ math, ...props }) => {
  const [Component, setComponent] = useState(null);
  
  useEffect(() => {
    const loadComponent = async () => {
      const { BlockMath: MathComp } = await import('react-katex');
      setComponent(() => MathComp);
    };
    
    loadComponent();
  }, []);
  
  if (!Component) {
    return <FallbackMath content={math} />;
  }
  
  return <Component math={math} {...props} />;
};

// Optimized code block with progressive enhancement
const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeContent = String(children).replace(/\n$/, '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyText, setCopyText] = useState('Copy Code');
  
  useEffect(() => {
    // Preload syntax highlighter on hover or when near viewport
    const preload = async () => {
      await Promise.all([
        import('react-syntax-highlighter'),
        import('react-syntax-highlighter/dist/esm/styles/prism')
      ]);
      setIsLoaded(true);
    };
    
    const timeout = setTimeout(preload, 300);
    return () => clearTimeout(timeout);
  }, []);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy Code'), 2000);
  };
  
  if (!inline && match) {
    if (!isLoaded) {
      return (
        <div className="relative my-8 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              {match[1]}
            </span>
            <button 
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-teal-400 transition-colors focus:outline-none"
            >
              Copy Code
            </button>
          </div>
          <pre className="m-0 p-6 bg-transparent text-sm overflow-x-auto">
            <code className="text-slate-300 font-mono whitespace-pre">
              {codeContent}
            </code>
          </pre>
        </div>
      );
    }
    
    return (
      <div className="relative my-8 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {match[1]}
          </span>
          <button 
            onClick={handleCopy}
            className="text-xs text-slate-500 hover:text-teal-400 transition-colors focus:outline-none"
          >
            {copyText}
          </button>
        </div>
        <Suspense fallback={
          <div className="p-6">
            <div className="h-4 bg-slate-800/50 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-slate-800/50 rounded animate-pulse mb-2 w-3/4"></div>
            <div className="h-4 bg-slate-800/50 rounded animate-pulse w-1/2"></div>
          </div>
        }>
          <SyntaxHighlighter
            PreTag="div"
            language={match[1]}
            customStyle={{ 
              margin: 0, 
              padding: '1.5rem', 
              background: 'transparent', 
              fontSize: '0.9rem' 
            }}
            {...props}
          >
            {codeContent}
          </SyntaxHighlighter>
        </Suspense>
      </div>
    );
  }
  
  return (
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

const LatexBlock = ({ content }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Preload on mount
    const load = async () => {
      await import('react-katex');
      setIsLoaded(true);
    };
    
    load();
  }, []);
  
  if (!isLoaded) {
    return (
      <div className="my-6 py-4 px-2 bg-slate-900/20 rounded-lg border border-slate-800/50 flex justify-center items-center shadow-inner">
        <div className="text-slate-400 italic">Loading formula...</div>
      </div>
    );
  }
  
  return (
    <div className="my-6 py-4 px-2 bg-slate-900/20 rounded-lg border border-slate-800/50 flex justify-center items-center shadow-inner overflow-x-auto">
      <div className="text-center">
        <Suspense fallback={
          <div className="text-slate-400 italic">Rendering formula...</div>
        }>
          <BlockMath math={content} />
        </Suspense>
      </div>
    </div>
  );
};

// Lazy-loaded Markdown renderer component
const LazyMarkdown = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      await Promise.all([
        import('react-markdown'),
        import('remark-math'),
        import('remark-breaks'),
        import('remark-gfm'),
        import('rehype-katex'),
        import('rehype-raw'),
        import('katex/dist/katex.min.css')
      ]);
      setIsLoaded(true);
    };
    
    load();
  }, []);
  
  if (!isLoaded) {
    return (
      <div className="text-slate-300 leading-relaxed">
        {children}
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div className="text-slate-300 leading-relaxed">{children}</div>
    }>
      <ReactMarkdown
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
        {children}
      </ReactMarkdown>
    </Suspense>
  );
};

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
          className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-teal-500 no-underline md:-left-8"
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
          <LazyMarkdown>
            {text}
          </LazyMarkdown>
        </div>
      );
    }
    
    return (
      <div className="mb-8 text-lg text-slate-300 leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={index} className="my-4">
                <LazyMarkdown>
                  {part.content}
                </LazyMarkdown>
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