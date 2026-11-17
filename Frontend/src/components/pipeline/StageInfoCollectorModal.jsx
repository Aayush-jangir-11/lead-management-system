import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, ClipboardList, CheckCircle2,
  Building2, Sparkles, FileText, ArrowRight, Save
} from 'lucide-react';

export default function StageInfoCollectorModal({
  isOpen,
  onClose,
  stage,
  deals = [],
  onSaveDealSections,
}) {
  if (!isOpen || !stage) return null;

  // Filter deals that belong to this stage
  const stageDeals = deals.filter((d) => d.stage === stage.id);

  // Selected Deal state
  const [selectedDealId, setSelectedDealId] = useState(
    stageDeals.length > 0 ? stageDeals[0].id : ''
  );

  // Dynamic sections state (like job form: Title + Content)
  const [sections, setSections] = useState([
    {
      id: 'sec_1',
      title: 'Client Business Pain Points & Needs',
      content: '',
    },
    {
      id: 'sec_2',
      title: 'Decision Maker & Evaluation Criteria',
      content: '',
    },
  ]);

  // When selected deal changes, load its existing saved sections for this stage
  useEffect(() => {
    if (!selectedDealId) return;
    const currentDeal = stageDeals.find((d) => d.id === selectedDealId);
    if (currentDeal?.stageSections?.[stage.id]?.length > 0) {
      setSections(currentDeal.stageSections[stage.id]);
    } else {
      // Default initial 2 sections
      setSections([
        {
          id: `sec_${Date.now()}_1`,
          title: 'Key Client Requirements & Goals',
          content: '',
        },
        {
          id: `sec_${Date.now()}_2`,
          title: 'Commercial & Budget Notes',
          content: '',
        },
      ]);
    }
  }, [selectedDealId, stage.id]);

  // Add another section (Job application form style!)
  const handleAddSection = () => {
    const newSection = {
      id: `sec_${Date.now()}`,
      title: '',
      content: '',
    };
    setSections([...sections, newSection]);
  };

  // Update a specific section
  const handleUpdateSection = (sectionId, field, value) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, [field]: value } : sec))
    );
  };

  // Remove a section
  const handleRemoveSection = (sectionId) => {
    if (sections.length <= 1) {
      // Keep at least one section box
      setSections([{ id: `sec_${Date.now()}`, title: '', content: '' }]);
      return;
    }
    setSections((prev) => prev.filter((sec) => sec.id !== sectionId));
  };

  // Handle Save
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDealId) {
      alert('Please select a deal to save information.');
      return;
    }

    // Filter out completely blank sections
    const validSections = sections.filter(
      (sec) => sec.title.trim() !== '' || sec.content.trim() !== ''
    );

    onSaveDealSections(selectedDealId, stage.id, validSections);
    onClose();
  };

  const currentDealObj = stageDeals.find((d) => d.id === selectedDealId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-18 pb-6 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 cursor-default flex flex-col max-h-[88vh] my-auto"
      >
        {/* Balanced Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ClipboardList size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor || 'bg-emerald-600'}`} />
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {stage.name} • Stage Info Collector
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                Record custom requirements and client updates for this stage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Deal Selector Strip */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-600" />
                <span>Select Deal in this Stage to Collect Information *</span>
              </label>

              {stageDeals.length === 0 ? (
                <div className="text-xs font-semibold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  No deals currently in "{stage.name}". Drag or move a deal into this stage to attach collected info.
                </div>
              ) : (
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-2xs"
                >
                  {stageDeals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.company} — ₹{(Number(d.value) || 0).toLocaleString('en-IN')} (Closer: {d.rep})
                    </option>
                  ))}
                </select>
              )}

              {currentDealObj && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Contact: <strong className="text-slate-700">{currentDealObj.contact}</strong></span>
                  <span>Target Close: <strong className="text-slate-700">{currentDealObj.targetClose}</strong></span>
                </div>
              )}
            </div>

            {/* Dynamic Sections Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Custom Information Sections ({sections.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Click "+ Add Another Section" to expand
              </span>
            </div>

            {/* Dynamic Sections List (Job Form Pattern) */}
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <div
                  key={section.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-3 relative hover:border-slate-300 transition-all group"
                >
                  {/* Section Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        Section #{idx + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove this section"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Section Title Input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Section Title / Question *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Current Software Used, Budget Timeline, Decision Criteria..."
                      value={section.title}
                      onChange={(e) =>
                        handleUpdateSection(section.id, 'title', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Section Information / Content Textarea */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Collected Information & Rep Notes *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type details, answers, or salesperson observations here..."
                      value={section.content}
                      onChange={(e) =>
                        handleUpdateSection(section.id, 'content', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* "+ Add Another Section" Button (Job Form Style!) */}
            <button
              type="button"
              onClick={handleAddSection}
              className="w-full py-3 bg-white hover:bg-emerald-50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl text-xs font-black text-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
            >
              <Plus size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>+ Add Another Section</span>
            </button>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              {sections.length} section{sections.length === 1 ? '' : 's'} configured
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={stageDeals.length === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                <span>Save Stage Information</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

