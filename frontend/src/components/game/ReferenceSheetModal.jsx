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
    <Modal isOpen={isOpen} onClose={onClose} title="📐 Official College Board Math Reference Sheet" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs text-center font-semibold">
          This reference sheet is provided on every Math section of the official Digital SAT.
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulas.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-heading">
                {item.title}
              </span>
              <div className="text-lg font-bold text-white text-center py-2 bg-black/40 rounded-lg border border-white/5">
                <QuestionRenderer content={item.formula.replace(/\n/g, '<br/>')} />
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
          <h5 className="font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">Important Rules & Notes:</h5>
          <ul className="list-disc pl-5 space-y-1">
            <li>The number of degrees of arc in a circle is <strong>360°</strong>.</li>
            <li>The number of radians of arc in a circle is <strong>2π</strong>.</li>
            <li>The sum of the measures in degrees of the angles of a triangle is <strong>180°</strong>.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="btn-secondary px-6 py-2 text-sm">
            Close Reference Sheet
          </button>
        </div>
      </div>
    </Modal>
  );
}
