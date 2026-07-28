import React from 'react';
import Modal from '../common/Modal';
import QuestionRenderer from '../question/QuestionRenderer';

export default function ReferenceSheetModal({ isOpen, onClose }) {
  const formulas = [
    { title: 'Circle', formula: '$A = \\pi r^2$ \n $C = 2\\pi r$' },
    { title: 'Rectangle', formula: '$A = l w$' },
    { title: 'Triangle', formula: '$A = \\frac{1}{2} b h$' },
    { title: 'Pythagorean Theorem', formula: '$a^2 + b^2 = c^2$' },
    { title: 'Special Right Triangles', formula: '$45^\\circ-45^\\circ-90^\\circ: x, x, x\\sqrt{2}$ \n $30^\\circ-60^\\circ-90^\\circ: x, x\\sqrt{3}, 2x$' },
    { title: 'Rectangular Prism', formula: '$V = l w h$' },
    { title: 'Cylinder', formula: '$V = \\pi r^2 h$' },
    { title: 'Sphere', formula: '$V = \\frac{4}{3} \\pi r^3$' },
    { title: 'Cone', formula: '$V = \\frac{1}{3} \\pi r^2 h$' },
    { title: 'Pyramid', formula: '$V = \\frac{1}{3} l w h$' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📐 Official College Board Math Reference Sheet" maxWidth="720px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(0, 242, 255, 0.1)', border: '1px solid rgba(0, 242, 255, 0.3)', color: 'var(--accent-cyan)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}>
          ⚡ This reference sheet is provided on every Math module of the official Digital SAT.
        </div>

        {/* Formulas Grid */}
        <div className="grid-2">
          {formulas.map((item, idx) => (
            <div key={idx} style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.title}
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', textAlign: 'center', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <QuestionRenderer content={item.formula.replace(/\n/g, '<br/>')} />
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          <h5 style={{ fontWeight: 800, color: 'white', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Important Rules & Notes:</h5>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: 1.6 }}>
            <li>The number of degrees of arc in a circle is <strong style={{ color: 'white' }}>360°</strong>.</li>
            <li>The number of radians of arc in a circle is <strong style={{ color: 'white' }}>2π</strong>.</li>
            <li>The sum of the measures in degrees of the angles of a triangle is <strong style={{ color: 'white' }}>180°</strong>.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Reference Sheet
          </button>
        </div>
      </div>
    </Modal>
  );
}
