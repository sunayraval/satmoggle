import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import katex from 'katex';

/**
 * QuestionRenderer
 * Advanced rendering engine for SAT math and reading questions.
 * Handles:
 * 1. Standard HTML and MathML (<math>) from College Board modern items.
 * 2. Embedded base64 PNG images and SVGs with responsive dark-mode styling.
 * 3. Inline and block LaTeX delimiters ($...$, \(...\), $$...$$, \[...\]).
 */
export default function QuestionRenderer({ content, className = '' }) {
  if (!content) return null;

  // 1. Pre-process LaTeX equations in text string into KaTeX HTML strings
  let processedHtml = typeof content === 'string' ? content : String(content);

  // Replace $$...$$ or \[...\] block math
  processedHtml = processedHtml.replace(/(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/g, (match, p1, mathExpr) => {
    try {
      return katex.renderToString(mathExpr.trim(), { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // Replace $...$ or \(...\) inline math
  processedHtml = processedHtml.replace(/(\$|\\\()([^\$\\\(]+?)(\$|\\\))/g, (match, p1, mathExpr) => {
    try {
      return katex.renderToString(mathExpr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 2. Custom HTML parser options to enhance elements for dark mode & responsiveness
  const options = {
    replace: (domNode) => {
      // Enhance images with dark-mode contrast backdrop and responsive bounds
      if (domNode.name === 'img') {
        const { src, alt, class: className } = domNode.attribs || {};
        return (
          <span className="inline-block my-2 max-w-full overflow-x-auto">
            <img 
              src={src} 
              alt={alt || 'SAT Diagram'} 
              className={`max-w-full h-auto rounded-lg bg-white/95 p-2 shadow-lg border border-white/20 ${className || ''}`}
              loading="lazy"
            />
          </span>
        );
      }

      // Enhance MathML tags to ensure crisp font sizing and cyan accent
      if (domNode.name === 'math') {
        return (
          <span className="inline-block align-middle px-1 font-serif text-cyan-300 text-lg">
            {domToReact([domNode], options)}
          </span>
        );
      }

      // Preserve tables with clean borders
      if (domNode.name === 'table') {
        return (
          <div className="overflow-x-auto my-4 w-full">
            <table className="w-full text-left border-collapse border border-white/20 rounded-lg overflow-hidden">
              {domToReact(domNode.children, options)}
            </table>
          </div>
        );
      }
    }
  };

  return (
    <div className={`question-content font-body text-slate-100 ${className}`}>
      {parse(processedHtml, options)}
    </div>
  );
}
