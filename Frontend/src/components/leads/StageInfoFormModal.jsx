import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, ClipboardList, Settings, Save,
  ArrowRight, Plus, Trash2, Edit3
} from 'lucide-react';

/**
 * StageInfoFormModal
 * Dynamically displays questionnaire/information fields pre-configured for a pipeline stage.
 * Reps can fill answers for this lead, AND edit/decide the question template for this stage.
 */
export default function StageInfoFormModal({
  isOpen,
  onClose,
  stage,
  lead,
  onSave,
  isSaving,
  onSaveTemplate,
}) {
  const [modalMode, setModalMode] = useState('fill'); // 'fill' | 'edit_template'
  const [formData, setFormData] = useState({});
  const [advanceStage, setAdvanceStage] = useState(true);

  // Template editing state
  const [editingFields, setEditingFields] = useState([]);
  const [isSavingTemplateState, setIsSavingTemplateState] = useState(false);

  // Default fallback questions if stage has no custom fields configured yet
  const defaultFields = React.useMemo(() => [
    {
      id: 'field_pain_points',
      label: 'Client Business Pain Points & Core Needs',
      placeholder: 'What problem is the client trying to solve?',
      fieldType: 'notes',
      required: true,
    },
    {
      id: 'field_budget_timeline',
      label: 'Approved Budget, Scope & Commercial Timeline',
      placeholder: 'Budget range, pricing structure, targeted launch date...',
      fieldType: 'notes',
      required: false,
    },
    {
      id: 'field_decision_maker',
      label: 'Key Decision Makers & Stakeholder Objections',
      placeholder: 'Who approves the contract? Any competitor preference?',
      fieldType: 'text',
      required: false,
    },
  ], []);

  // Effective questions to display for this stage
  const formFields = React.useMemo(() => {
    if (!stage) return [];
    if (Array.isArray(stage.formFields) && stage.formFields.length > 0) {
      return stage.formFields;
    }
    return defaultFields;
  }, [stage, defaultFields]);

  // Synchronize fields and existing answers on stage open
  useEffect(() => {
    if (!stage || !isOpen) return;

    setModalMode('fill');

    // Initialize editingFields with existing stage formFields or defaults
    if (Array.isArray(stage.formFields) && stage.formFields.length > 0) {
      setEditingFields(stage.formFields.map((f) => ({ ...f })));
    } else {
      setEditingFields(defaultFields.map((f) => ({ ...f })));
    }

    // Retrieve any existing answers for this lead
    let existingSections = [];
    if (lead?.stageSections) {
      if (lead.stageSections instanceof Map) {
        existingSections = lead.stageSections.get(String(stage.id || stage._id)) || [];
      } else if (typeof lead.stageSections === 'object') {
        existingSections = lead.stageSections[String(stage.id || stage._id)] || [];
      }
    }

    const initialValues = {};
    formFields.forEach((field) => {
      const match = existingSections.find(
        (sec) => sec.id === field.id || sec.title?.toLowerCase() === field.label?.toLowerCase()
      );
      initialValues[field.id] = match ? match.content : '';
    });

    setFormData(initialValues);

    const currentLeadStageId = lead?.stage?._id || lead?.stage;
    const isDifferent = String(currentLeadStageId) !== String(stage.id || stage._id);
    setAdvanceStage(isDifferent);
  }, [stage, isOpen, lead, formFields, defaultFields]);

  if (!isOpen || !stage) return null;

  const isCurrentStage =
    String(lead?.stage?._id || lead?.stage) === String(stage.id || stage._id) ||
    lead?.status?.toLowerCase() === stage?.name?.toLowerCase();

  const handleFieldChange = (fieldId, val) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSaveAnswers = (e) => {
    e.preventDefault();

    const sections = formFields.map((field) => ({
      id: field.id,
      title: field.label,
      content: formData[field.id] || '',
    }));

    onSave({
      stageId: String(stage.id || stage._id),
      stageName: stage.name,
      sections,
      advanceStage,
    });
  };

  const handleSaveTemplateSubmit = async (e) => {
    e.preventDefault();
    const valid = editingFields.filter((f) => f.label && f.label.trim().length > 0);
    if (valid.length === 0) return;

    setIsSavingTemplateState(true);
    try {
      if (onSaveTemplate) {
        await onSaveTemplate({
          stageId: String(stage.id || stage._id),
          formFields: valid,
        });
      }
      setModalMode('fill');
    } finally {
      setIsSavingTemplateState(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-20 pb-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <ClipboardList size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{stage.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {stage.probability}% Win Prob
                </span>
                {isCurrentStage && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Current Stage
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {modalMode === 'fill' ? (
                  <>Stage questionnaire for <strong className="text-slate-700">{lead?.name || 'this lead'}</strong></>
                ) : (
                  <>Configure questions reps must answer for <strong>{stage.name}</strong></>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Banner */}
        <div className="px-6 py-2 bg-slate-100/80 border-b border-slate-200/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setModalMode('fill')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modalMode === 'fill'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fill Answers
            </button>
            <button
              type="button"
              onClick={() => setModalMode('edit_template')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                modalMode === 'edit_template'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 size={11} />
              <span>Edit Questions / Fields</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            {modalMode === 'fill'
              ? `${formFields.length} question(s)`
              : 'Customize question template'}
          </span>
        </div>

        {/* ── MODE 1: FILL ANSWERS FOR THIS LEAD ────────────────────────────── */}
        {modalMode === 'fill' && (
          <>
            <form onSubmit={handleSaveAnswers} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div className="space-y-4">
                {formFields.map((field, idx) => {
                  const val = formData[field.id] || '';
                  return (
                    <div
                      key={field.id || idx}
                      className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-emerald-700 flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span>{field.label}</span>
                          {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </label>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {field.fieldType || 'notes'}
                        </span>
                      </div>

                      {field.fieldType === 'number' ? (
                        <input
                          type="number"
                          required={field.required}
                          placeholder={field.placeholder || 'Enter value...'}
                          value={val}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      ) : field.fieldType === 'text' ? (
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || 'Enter detail...'}
                          value={val}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      ) : (
                        <textarea
                          rows={3}
                          required={field.required}
                          placeholder={field.placeholder || 'Record details, client answers, or requirements...'}
                          value={val}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stage Advance Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={advanceStage}
                    onChange={(e) => setAdvanceStage(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Shift lead progression to "{stage.name}"</span>
                      <ArrowRight size={12} className="text-emerald-600" />
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Check this to also update the lead's current stage and status.
                    </span>
                  </div>
                </label>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAnswers}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>
                  {isSaving
                    ? 'Saving...'
                    : advanceStage
                    ? `Save Info & Move to ${stage.name}`
                    : 'Save Stage Information'}
                </span>
              </button>
            </div>
          </>
        )}

        {/* ── MODE 2: DECIDE / EDIT QUESTIONS TEMPLATE ─────────────────────── */}
        {modalMode === 'edit_template' && (
          <>
            <form onSubmit={handleSaveTemplateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {/* Questions List */}
              <div className="space-y-2.5">
                {editingFields.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <ClipboardList size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No questions defined for this stage yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add Question" below to add custom fields.</p>
                  </div>
                ) : (
                  editingFields.map((fld, idx) => (
                    <div
                      key={fld.id || idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-emerald-700 flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={fld.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingFields((prev) =>
                              prev.map((f, i) => (i === idx ? { ...f, label: val } : f))
                            );
                          }}
                          placeholder="Question Title (e.g. Budget Breakdown)..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <select
                          value={fld.fieldType || 'notes'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingFields((prev) =>
                              prev.map((f, i) => (i === idx ? { ...f, fieldType: val } : f))
                            );
                          }}
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="notes">Notes / Multi-line</option>
                          <option value="text">Short Text</option>
                          <option value="number">Number / Amount</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setEditingFields((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={fld.placeholder || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingFields((prev) =>
                            prev.map((f, i) => (i === idx ? { ...f, placeholder: val } : f))
                          );
                        }}
                        placeholder="Optional hint / placeholder for the sales rep..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1 text-[11px] text-slate-600 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* + Add Question Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingFields((prev) => [
                    ...prev,
                    {
                      id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                      label: '',
                      fieldType: 'notes',
                      placeholder: '',
                      required: false,
                    },
                  ]);
                }}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Add Another Question</span>
              </button>
            </form>

            {/* Template Edit Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setModalMode('fill')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                ← Back to Fill Form
              </button>

              <button
                type="button"
                onClick={handleSaveTemplateSubmit}
                disabled={isSavingTemplateState}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSavingTemplateState ? 'Saving Questions...' : 'Save Questions for this Stage'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
