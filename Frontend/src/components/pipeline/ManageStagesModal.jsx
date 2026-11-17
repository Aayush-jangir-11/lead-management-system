import React, { useState } from 'react';
import {
  X, Plus, ArrowUp, ArrowDown, Trash2, Edit2, Check,
  Sparkles, Layers, Sliders, RotateCcw, AlertTriangle, ArrowRight,
  ClipboardList
} from 'lucide-react';

export const COLOR_THEMES = [
  {
    id: 'blue',
    name: 'Blue',
    color: 'border-blue-300 bg-blue-50/60',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-500',
    preview: 'bg-blue-500',
  },
  {
    id: 'purple',
    name: 'Purple',
    color: 'border-purple-300 bg-purple-50/60',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    dotColor: 'bg-purple-500',
    preview: 'bg-purple-500',
  },
  {
    id: 'teal',
    name: 'Teal',
    color: 'border-teal-300 bg-teal-50/60',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    dotColor: 'bg-teal-500',
    preview: 'bg-teal-500',
  },
  {
    id: 'amber',
    name: 'Amber',
    color: 'border-amber-300 bg-amber-50/60',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    preview: 'bg-amber-500',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    color: 'border-emerald-300 bg-emerald-50/60',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    preview: 'bg-emerald-500',
  },
  {
    id: 'rose',
    name: 'Rose',
    color: 'border-rose-300 bg-rose-50/60',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    preview: 'bg-rose-500',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    color: 'border-indigo-300 bg-indigo-50/60',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dotColor: 'bg-indigo-500',
    preview: 'bg-indigo-500',
  },
  {
    id: 'green',
    name: 'Green (Won)',
    color: 'border-green-300 bg-green-50/60',
    badgeColor: 'bg-green-100 text-green-900 border-green-300',
    dotColor: 'bg-green-600',
    preview: 'bg-green-600',
  },
];

export default function ManageStagesModal({
  isOpen,
  onClose,
  stages = [],
  deals = [],
  onMoveStageUp,
  onMoveStageDown,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  onResetDefaultStages,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('reorder'); // 'reorder' or 'add'
  const [editingStageId, setEditingStageId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', probability: 50 });

  // Add Stage Form State
  const [newStageName, setNewStageName] = useState('');
  const [newStageProbability, setNewStageProbability] = useState(50);
  const [newStageColorTheme, setNewStageColorTheme] = useState('blue');
  const [newStagePosition, setNewStagePosition] = useState('end'); // 'end', 'start', or stage id to insert after

  // Sort stages by order
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  // Handle Edit Click
  const startEditing = (stg) => {
    setEditingStageId(stg.id);
    setEditForm({ name: stg.name, probability: stg.probability });
  };

  const saveEdit = (stgId) => {
    if (!editForm.name.trim()) return;
    onUpdateStage(stgId, {
      name: editForm.name.trim(),
      probability: Number(editForm.probability) || 50,
    });
    setEditingStageId(null);
  };

  // Handle Add Stage Submit
  const handleCreateStage = (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const selectedTheme = COLOR_THEMES.find((c) => c.id === newStageColorTheme) || COLOR_THEMES[0];

    onAddStage({
      name: newStageName.trim(),
      probability: Number(newStageProbability) || 50,
      color: selectedTheme.color,
      badgeColor: selectedTheme.badgeColor,
      dotColor: selectedTheme.dotColor,
      position: newStagePosition,
    });

    // Reset form
    setNewStageName('');
    setNewStageProbability(50);
    setNewStageColorTheme('blue');
    setNewStagePosition('end');
    setActiveTab('reorder');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-18 pb-6 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 cursor-default flex flex-col max-h-[88vh] my-auto"
      >
        {/* Compact Slim Header */}
        <div className="px-5 py-3 sm:px-6 sm:py-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  Pipeline Funnel & Stages Manager
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {stages.length} Stages
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Reorder sales sequence or dynamically add custom company stages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('reorder')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'reorder'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Sliders size={14} />
            <span>Reorder Sequence ({sortedStages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'add'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Plus size={14} />
            <span>+ Add New Stage</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'reorder' ? (
            /* TAB 1: REORDER SEQUENCE */
            <div className="space-y-4">
              {/* Funnel Preview Strip */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Live Funnel Flow Sequence
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {sortedStages.map((stg, i) => (
                    <React.Fragment key={stg.id}>
                      <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                          {i + 1}
                        </span>
                        <span>{stg.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">({stg.probability}%)</span>
                      </div>
                      {i < sortedStages.length - 1 && (
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Stage Items List */}
              <div className="space-y-2.5">
                {sortedStages.map((stg, idx) => {
                  const stageDealsCount = deals.filter((d) => d.stage === stg.id).length;
                  const isFirst = idx === 0;
                  const isLast = idx === sortedStages.length - 1;
                  const isEditing = editingStageId === stg.id;

                  return (
                    <div
                      key={stg.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Step Index & Stage Details */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-black text-xs shrink-0">
                          #{idx + 1}
                        </div>

                        <span className={`w-3 h-3 rounded-full shrink-0 ${stg.dotColor}`} />

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="px-2.5 py-1 border border-emerald-400 rounded-lg text-xs font-bold text-slate-800 focus:outline-none w-full max-w-xs"
                              placeholder="Stage Name"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editForm.probability}
                                onChange={(e) => setEditForm({ ...editForm, probability: e.target.value })}
                                className="w-16 px-2 py-1 border border-emerald-400 rounded-lg text-xs font-bold text-slate-800 focus:outline-none text-center"
                                placeholder="Win %"
                              />
                              <span className="text-xs font-bold text-slate-400">%</span>
                            </div>
                            <button
                              onClick={() => saveEdit(stg.id)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                              title="Save"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setEditingStageId(null)}
                              className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                                {stg.name}
                              </h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${stg.badgeColor}`}>
                                {stg.probability}% win prob.
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                              {stageDealsCount} active deal{stageDealsCount === 1 ? '' : 's'} assigned to this stage
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions (Move Up, Move Down, Edit, Delete) */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          {/* Move Up */}
                          <button
                            onClick={() => onMoveStageUp(stg.id)}
                            disabled={isFirst}
                            title="Move earlier in funnel (Up)"
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${isFirst
                                ? 'opacity-30 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                              }`}
                          >
                            <ArrowUp size={14} />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => onMoveStageDown(stg.id)}
                            disabled={isLast}
                            title="Move later in funnel (Down)"
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${isLast
                                ? 'opacity-30 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                              }`}
                          >
                            <ArrowDown size={14} />
                          </button>

                          {/* Edit Stage */}
                          <button
                            onClick={() => startEditing(stg)}
                            title="Rename or update probability"
                            className="p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete Stage */}
                          <button
                            onClick={() => onDeleteStage(stg.id)}
                            disabled={sortedStages.length <= 0}
                            title={
                              sortedStages.length <= 0
                                ? 'No stages to delete'
                                : 'Delete this stage'
                            }
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${sortedStages.length <= 0
                                ? 'opacity-30 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                              }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 2: ADD NEW STAGE */
            <form onSubmit={handleCreateStage} className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 mb-2">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-xs mb-1">
                  <Sparkles size={14} className="text-emerald-700" />
                  <span>Create a Dynamic Stage for Your Workflow</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Companies have unique sales cycles. Add custom qualification, technical demo, security audit, or legal review stages and place them exactly where they belong in the pipeline funnel.
                </p>
              </div>

              {/* Stage Name */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Stage Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Technical Feasibility & Architecture Review"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Win Probability Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700">
                    Expected Win Probability (%)
                  </label>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {newStageProbability}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={newStageProbability}
                  onChange={(e) => setNewStageProbability(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>5% (Early Lead)</span>
                  <span>50% (Mid-Funnel)</span>
                  <span>100% (Closed Won)</span>
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Stage Color Theme
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {COLOR_THEMES.map((theme) => {
                    const isSelected = newStageColorTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setNewStageColorTheme(theme.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${isSelected
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${theme.preview}`} />
                        <span className="text-[10px] text-slate-700">{theme.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Position in Sequence */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Sequence Position in Funnel *
                </label>
                <select
                  value={newStagePosition}
                  onChange={(e) => setNewStagePosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                >
                  <option value="end">
                    At the End of Funnel (Step #{sortedStages.length + 1})
                  </option>
                  <option value="start">
                    At the Beginning of Funnel (Step #1)
                  </option>
                  {sortedStages.map((stg, i) => (
                    <option key={stg.id} value={stg.id}>
                      After Step #{i + 1} "{stg.name}" (Insert at Step #{i + 2})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Create & Insert Stage Into Funnel</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-500">
            Total {sortedStages.length} stage{sortedStages.length !== 1 ? 's' : ''} configured
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

