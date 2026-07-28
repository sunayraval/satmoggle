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
        const { src, alt, class: clsName } = domNode.attribs || {};
        return (
          <span style={{ display: 'inline-block', margin: '0.75rem 0', maxWidth: '100%', overflowX: 'auto' }}>
            <img 
              src={src} 
              alt={alt || 'SAT Diagram'} 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.95)', padding: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)' }}
              loading="lazy"
            />
          </span>
        );
      }

      // Enhance MathML tags to ensure crisp font sizing and cyan accent
      if (domNode.name === 'math') {
        return (
          <span style={{ display: 'inline-block', verticalAlign: 'middle', padding: '0 0.25rem', fontFamily: 'serif', color: 'var(--accent-cyan)', fontSize: '1.15rem', fontWeight: 700 }}>
            {domToReact([domNode], options)}
          </span>
        );
      }

      // Preserve tables with clean borders
      if (domNode.name === 'table') {
        return (
          <div style={{ overflowX: 'auto', margin: '1rem 0', width: '100%' }}>
            <table className="custom-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              {domToReact(domNode.children, options)}
            </table>
          </div>
        );
      }
    }
  };

  return (
    <div className={`question-content ${className}`} style={{ color: 'var(--text-main)', lineHeight: 1.8 }}>
      {parse(processedHtml, options)}
    </div>
  );
}
