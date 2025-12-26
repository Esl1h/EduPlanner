
import React, { useState, useRef } from 'react';
import { 
  Users, BookOpen, Home, Settings, Calendar as CalendarIcon, 
  ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, Download, Upload, Info, 
  Printer, LayoutGrid, Monitor
} from 'lucide-react';
import { 
  BaseConfig, Room, Subject, Group, Teacher, Workload, 
  AdvancedRules, Step, ScheduleSlot, TeacherRestriction 
} from './types';
import { WEEK_DAYS, SUBJECT_COLORS, SCHOOL_LEVELS, SHIFTS, INITIAL_BASE_CONFIG } from './constants';
import { generateScheduleAI } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('config');
  const [baseConfig, setBaseConfig] = useState<BaseConfig>(INITIAL_BASE_CONFIG);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [workload, setWorkload] = useState<Workload>({});
  const [rules, setRules] = useState<AdvancedRules>({
    avoidTeacherGaps: true,
    uniformDistribution: true,
    groupConsecutive: true,
    theoryEarly: true,
    balanceWorkload: true,
    labRule: 'none',
    maxConsecutive: 2
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stepsList: { key: Step; label: string; icon: any }[] = [
    { key: 'config', label: 'Configurações', icon: Settings },
    { key: 'rooms', label: 'Salas', icon: Home },
    { key: 'subjects', label: 'Matérias', icon: BookOpen },
    { key: 'groups', label: 'Turmas', icon: LayoutGrid },
    { key: 'teachers', label: 'Professores', icon: Users },
    { key: 'workload', label: 'Carga Horária', icon: Monitor },
    { key: 'rules', label: 'Regras', icon: Sparkles },
    { key: 'generate', label: 'Gerar', icon: CheckCircle2 }
  ];

  const handleNext = () => {
    const idx = stepsList.findIndex(s => s.key === currentStep);
    if (idx < stepsList.length - 1) setCurrentStep(stepsList[idx + 1].key);
  };

  const handleBack = () => {
    const idx = stepsList.findIndex(s => s.key === currentStep);
    if (idx > 0) setCurrentStep(stepsList[idx - 1].key);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.baseConfig) setBaseConfig(data.baseConfig);
        if (data.rooms) setRooms(data.rooms);
        if (data.subjects) setSubjects(data.subjects);
        if (data.groups) setGroups(data.groups);
        if (data.teachers) setTeachers(data.teachers);
        if (data.workload) setWorkload(data.workload);
        if (data.rules) setRules(data.rules);
      } catch (err) {
        alert("Erro ao importar JSON: Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  };

  const exportFullJson = () => {
    const fullData = { baseConfig, rooms, subjects, groups, teachers, workload, rules, schedule };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduplanner_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateScheduleAI(baseConfig, rooms, subjects, groups, teachers, workload, rules);
      setSchedule(result);
      setCurrentStep('result');
    } catch (err) {
      setError("Houve um erro técnico ao gerar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-indigo-600 text-white px-6 py-2 flex justify-between items-center text-xs shadow-md">
        <div className="flex items-center gap-2">
          <Info size={14} /> 
          <span>Suporte Técnico: contato@eduplanner.ai</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Manual do Usuário</a>
          <a href="#" className="hover:underline">Fale Conosco</a>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">EduPlanner AI</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Smart School Scheduler</p>
            </div>
          </div>

          {currentStep !== 'result' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide max-w-full">
              {stepsList.map((step, idx) => {
                const isActive = currentStep === step.key;
                const isPast = stepsList.findIndex(s => s.key === currentStep) > idx;
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <button 
                      onClick={() => setCurrentStep(step.key)}
                      className={`flex flex-col items-center gap-1 min-w-[80px] transition-all group ${
                        isActive ? 'text-indigo-600 scale-105' : isPast ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-full border-2 transition-colors ${
                        isActive ? 'bg-indigo-50 border-indigo-600' : isPast ? 'bg-emerald-50 border-emerald-500' : 'bg-transparent border-slate-100 group-hover:border-slate-300'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-bold uppercase">{step.label}</span>
                    </button>
                    {idx < stepsList.length - 1 && (
                      <div className={`h-[2px] w-4 mt-[-18px] ${isPast ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-10">
          {currentStep === 'config' && <ConfigStep config={baseConfig} setConfig={setBaseConfig} handleImport={handleImportJson} />}
          {currentStep === 'rooms' && <RoomsStep rooms={rooms} setRooms={setRooms} />}
          {currentStep === 'subjects' && <SubjectsStep subjects={subjects} setSubjects={setSubjects} />}
          {currentStep === 'groups' && <GroupsStep groups={groups} setGroups={setGroups} baseConfig={baseConfig} />}
          {currentStep === 'teachers' && <TeachersStep teachers={teachers} setTeachers={setTeachers} subjects={subjects} />}
          {currentStep === 'workload' && <WorkloadStep workload={workload} setWorkload={setWorkload} groups={groups} subjects={subjects} />}
          {currentStep === 'rules' && <RulesStep rules={rules} setRules={setRules} />}
          {currentStep === 'generate' && (
            <GenerateStep 
              teachers={teachers} groups={groups} rooms={rooms} 
              onGenerate={handleGenerate} isGenerating={isGenerating} error={error} 
            />
          )}
          {currentStep === 'result' && (
            <ResultStep 
              schedule={schedule} teachers={teachers} groups={groups} 
              rooms={rooms} subjects={subjects} onBack={() => setCurrentStep('generate')} 
              exportFull={exportFullJson}
            />
          )}
        </div>

        {currentStep !== 'result' && (
          <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={handleBack}
              disabled={currentStep === 'config'}
              className="px-6 py-2 text-slate-500 font-bold disabled:opacity-30 flex items-center gap-2 hover:text-slate-800 transition"
            >
              <ChevronLeft size={20} /> Anterior
            </button>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Passo {stepsList.findIndex(s => s.key === currentStep) + 1} de {stepsList.length}
            </div>
            <button 
              onClick={handleNext}
              disabled={currentStep === 'generate'}
              className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              Próximo <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-xs">
        EduPlanner AI &copy; 2024. Desenvolvido para eficiência acadêmica.
      </footer>
    </div>
  );
};

// --- Wizard Steps ---

const ConfigStep: React.FC<{ config: BaseConfig, setConfig: any, handleImport: any }> = ({ config, setConfig, handleImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const toggleDay = (day: string) => {
    setConfig({
      ...config,
      teachingDays: config.teachingDays.includes(day) 
        ? config.teachingDays.filter(d => d !== day) 
        : [...config.teachingDays, day]
    });
  };

  const addSchedule = () => {
    const name = prompt("Nome do Horário (ex: Matutino):");
    if (!name) return;
    setConfig({
      ...config,
      schedules: [...config.schedules, { name, startTime: '07:30', endTime: '12:30' }]
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Configurações Básicas</h2>
          <p className="text-slate-500">Defina o esqueleto temporal do seu ano letivo.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100 hover:bg-emerald-100 transition"
        >
          <Upload size={18} /> Importar Configuração
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} accept=".json" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={18} /> Estrutura de Horários</h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={config.differentSchedules} 
                onChange={(e) => setConfig({ ...config, differentSchedules: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600"
              />
              <span className="font-medium text-slate-600 group-hover:text-slate-900">Horários diferentes por turmas</span>
            </label>

            {!config.differentSchedules ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Entrada Padrão</label>
                  <input type="time" value={config.defaultStartTime} onChange={e => setConfig({...config, defaultStartTime: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Saída Padrão</label>
                  <input type="time" value={config.defaultEndTime} onChange={e => setConfig({...config, defaultEndTime: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Listagem de Turnos</span>
                  <button onClick={addSchedule} className="text-indigo-600 text-xs font-bold hover:underline">+ Adicionar</button>
                </div>
                {config.schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border">
                    <span className="flex-1 font-bold text-slate-700">{s.name}</span>
                    <input type="time" value={s.startTime} onChange={e => {
                      const newS = [...config.schedules];
                      newS[idx].startTime = e.target.value;
                      setConfig({...config, schedules: newS});
                    }} className="text-xs border rounded p-1" />
                    <input type="time" value={s.endTime} onChange={e => {
                      const newS = [...config.schedules];
                      newS[idx].endTime = e.target.value;
                      setConfig({...config, schedules: newS});
                    }} className="text-xs border rounded p-1" />
                    <button onClick={() => setConfig({...config, schedules: config.schedules.filter((_, i) => i !== idx)})} className="text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><LayoutGrid size={18} /> Duração (Minutos)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Aula</label>
                <input type="number" value={config.classDuration} onChange={e => setConfig({...config, classDuration: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Lanche</label>
                <input type="number" value={config.snackDuration} onChange={e => setConfig({...config, snackDuration: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Almoço</label>
                <input type="number" value={config.lunchDuration} onChange={e => setConfig({...config, lunchDuration: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><CalendarIcon size={18} /> Dias Letivos</h3>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(day => (
                <button 
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold transition ${
                    config.teachingDays.includes(day) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomsStep: React.FC<{ rooms: Room[], setRooms: any }> = ({ rooms, setRooms }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Room['type']>('regular');
  const [capacity, setCapacity] = useState(30);

  const addRoom = () => {
    if (!name) return;
    setRooms([...rooms, { id: crypto.randomUUID(), name, type, capacity }]);
    setName('');
  };

  const getIcon = (type: Room['type']) => {
    switch (type) {
      case 'lab': return <Monitor size={18} />;
      case 'sports': return <Sparkles size={18} />;
      case 'library': return <BookOpen size={18} />;
      default: return <Home size={18} />;
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Gerenciamento de Salas</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-slate-700">Nova Sala</h3>
          <input placeholder="Nome da Sala" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl" />
          <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-3 border rounded-xl">
            <option value="regular">Regular</option>
            <option value="lab">Laboratório</option>
            <option value="sports">Quadra / Esportes</option>
            <option value="library">Biblioteca</option>
          </select>
          <input type="number" placeholder="Capacidade" value={capacity} onChange={e => setCapacity(parseInt(e.target.value))} className="w-full p-3 border rounded-xl" />
          <button onClick={addRoom} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Adicionar</button>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 h-fit">
          {rooms.map(r => (
            <div key={r.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center gap-2 group relative transition-transform hover:-translate-y-1">
              <div className="text-indigo-600 p-2 bg-indigo-50 rounded-full">{getIcon(r.type)}</div>
              <span className="font-bold text-slate-800 text-sm truncate w-full text-center">{r.name}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">{r.type}</span>
              <button onClick={() => setRooms(rooms.filter(x => x.id !== r.id))} className="absolute top-2 right-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SubjectsStep: React.FC<{ subjects: Subject[], setSubjects: any }> = ({ subjects, setSubjects }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Subject['type']>('theoretical');
  const [color, setColor] = useState(SUBJECT_COLORS[0]);

  const addSubject = () => {
    if (!name) return;
    setSubjects([...subjects, { id: crypto.randomUUID(), name, type, color }]);
    setName('');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Matérias & Disciplinas</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
          <input placeholder="Nome da Matéria" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl" />
          <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-3 border rounded-xl">
            <option value="theoretical">Teórica</option>
            <option value="practical">Prática</option>
            <option value="lab">Laboratório</option>
          </select>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition ${color === c ? 'border-indigo-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <button onClick={addSubject} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Salvar Matéria</button>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 h-fit">
          {subjects.map(s => (
            <div key={s.id} className="p-4 rounded-2xl text-white shadow-lg relative group transition-transform hover:-translate-y-1" style={{ backgroundColor: s.color }}>
              <div className="font-bold text-sm mb-1">{s.name}</div>
              <div className="text-[10px] uppercase font-bold opacity-80">{s.type}</div>
              <button onClick={() => setSubjects(subjects.filter(x => x.id !== s.id))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-white/50 hover:text-white"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GroupsStep: React.FC<{ groups: Group[], setGroups: any, baseConfig: BaseConfig }> = ({ groups, setGroups, baseConfig }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(SCHOOL_LEVELS[0]);
  const [shift, setShift] = useState<Group['shift']>('morning');
  const [snack, setSnack] = useState('09:00');
  const [lunch, setLunch] = useState('12:00');
  const [scheduleId, setScheduleId] = useState(baseConfig.schedules[0]?.name || '');

  const addGroup = () => {
    if (!name) return;
    setGroups([...groups, { id: crypto.randomUUID(), name, level, shift, snackTime: snack, lunchTime: lunch, scheduleId }]);
    setName('');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Turmas & Séries</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
          <input placeholder="Ex: 9º Ano A" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-3 border rounded-xl text-sm">
              {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={shift} onChange={e => setShift(e.target.value as any)} className="w-full p-3 border rounded-xl text-sm">
              {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Lanche</label>
              <input type="time" value={snack} onChange={e => setSnack(e.target.value)} className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Almoço</label>
              <input type="time" value={lunch} onChange={e => setLunch(e.target.value)} className="w-full p-2 border rounded-xl text-sm" />
            </div>
          </div>
          {baseConfig.differentSchedules && (
            <select value={scheduleId} onChange={e => setScheduleId(e.target.value)} className="w-full p-3 border rounded-xl text-sm">
              {baseConfig.schedules.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          )}
          <button onClick={addGroup} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Criar Turma</button>
        </div>
        <div className="md:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {groups.map(g => (
            <div key={g.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 font-bold">{g.name}</div>
                <div>
                  <div className="font-bold text-slate-800">{g.level} - {g.shift}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Intervalos: {g.snackTime} | {g.lunchTime}</div>
                </div>
              </div>
              <button onClick={() => setGroups(groups.filter(x => x.id !== g.id))} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TeachersStep: React.FC<{ teachers: Teacher[], setTeachers: any, subjects: Subject[] }> = ({ teachers, setTeachers, subjects }) => {
  const [name, setName] = useState('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [isFull, setIsFull] = useState(true);
  const [restrictions, setRestrictions] = useState<TeacherRestriction[]>([]);
  
  // Restriction Form
  const [resDays, setResDays] = useState<string[]>([]);
  const [resStart, setResStart] = useState('07:30');
  const [resEnd, setResEnd] = useState('12:30');

  const addRestriction = () => {
    if (resDays.length === 0) return;
    setRestrictions([...restrictions, { id: crypto.randomUUID(), days: resDays, startTime: resStart, endTime: resEnd }]);
    setResDays([]);
  };

  const addTeacher = () => {
    if (!name || selectedSubs.length === 0) return;
    setTeachers([...teachers, { id: crypto.randomUUID(), name, subjects: selectedSubs, isFullyAvailable: isFull, restrictions: isFull ? [] : restrictions }]);
    setName(''); setSelectedSubs([]); setRestrictions([]); setIsFull(true);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Corpo Docente</h2>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
          <h3 className="font-bold text-slate-700 text-lg">Cadastro de Professor</h3>
          <input placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 border rounded-2xl shadow-sm" />
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matérias que Leciona</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSelectedSubs(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${selectedSubs.includes(s.id) ? 'bg-white border-indigo-600 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                  style={selectedSubs.includes(s.id) ? { borderColor: s.color, color: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <input type="checkbox" checked={isFull} onChange={e => setIsFull(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="font-bold text-slate-700">Horário 100% disponível</span>
          </label>

          {!isFull && (
            <div className="bg-amber-50 p-6 rounded-3xl space-y-4 border border-amber-100">
              <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2"><AlertCircle size={16} /> Restrições de Horário</h4>
              <div className="flex gap-1">
                {WEEK_DAYS.map(d => (
                  <button key={d} onClick={() => setResDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])} className={`w-8 h-8 rounded-lg text-[10px] font-bold ${resDays.includes(d) ? 'bg-amber-600 text-white' : 'bg-white text-amber-300'}`}>{d}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="time" value={resStart} onChange={e => setResStart(e.target.value)} className="p-2 border rounded-xl text-xs" />
                <input type="time" value={resEnd} onChange={e => setResEnd(e.target.value)} className="p-2 border rounded-xl text-xs" />
              </div>
              <button onClick={addRestriction} className="w-full py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">+ Adicionar Restrição</button>
              <div className="space-y-1">
                {restrictions.map(r => (
                  <div key={r.id} className="flex justify-between items-center bg-white/50 p-2 rounded-lg text-[10px] font-bold text-amber-800">
                    <span>{r.days.join(', ')} | {r.startTime}-{r.endTime}</span>
                    <button onClick={() => setRestrictions(p => p.filter(x => x.id !== r.id))}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={addTeacher} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Salvar Professor</button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {teachers.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{t.name}</h4>
                  <div className="flex items-center gap-2">
                    {t.isFullyAvailable 
                      ? <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 size={12} /> 100% Disponível</span>
                      : <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12} /> {t.restrictions.length} Restrições</span>
                    }
                  </div>
                </div>
                <button onClick={() => setTeachers(teachers.filter(x => x.id !== t.id))} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-1">
                {t.subjects.map(sid => {
                  const s = subjects.find(x => x.id === sid);
                  return <span key={sid} className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: s?.color }}>{s?.name}</span>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorkloadStep: React.FC<{ workload: Workload, setWorkload: any, groups: Group[], subjects: Subject[] }> = ({ workload, setWorkload, groups, subjects }) => {
  const updateWorkload = (gid: string, sid: string, val: number) => {
    setWorkload({
      ...workload,
      [gid]: {
        ...(workload[gid] || {}),
        [sid]: val
      }
    });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Matriz de Carga Horária</h2>
      <div className="overflow-x-auto rounded-[2rem] border border-slate-200 shadow-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-6 text-left font-bold text-slate-400 uppercase text-[10px] tracking-widest sticky left-0 bg-slate-50 z-10 border-r w-40">Turma \ Matéria</th>
              {subjects.map(s => (
                <th key={s.id} className="p-4 text-center border-r last:border-0">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter block truncate max-w-[80px]">{s.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                <td className="p-6 font-bold text-slate-800 bg-white sticky left-0 z-10 border-r">{g.name}</td>
                {subjects.map(s => (
                  <td key={s.id} className="p-2 border-r last:border-0">
                    <input 
                      type="number" 
                      min="0" max="10" 
                      value={workload[g.id]?.[s.id] || 0}
                      onChange={e => updateWorkload(g.id, s.id, parseInt(e.target.value) || 0)}
                      className="w-16 mx-auto block p-2 text-center font-bold text-indigo-600 bg-indigo-50/30 rounded-xl border border-transparent focus:border-indigo-300 outline-none" 
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RulesStep: React.FC<{ rules: AdvancedRules, setRules: any }> = ({ rules, setRules }) => {
  const toggle = (field: keyof AdvancedRules) => setRules({ ...rules, [field]: !rules[field] });

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold text-slate-900">Regras & Inteligência</h2>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Regras Gerais de Otimização</h3>
          {[
            { key: 'avoidTeacherGaps', label: 'Evitar janelas livres para professores', desc: 'Minimiza tempos ociosos entre aulas de um mesmo docente.' },
            { key: 'uniformDistribution', label: 'Distribuir aulas uniformemente', desc: 'Evita sobrecarga de uma mesma matéria no mesmo dia.' },
            { key: 'groupConsecutive', label: 'Agrupar aulas da mesma matéria', desc: 'Prioriza aulas duplas ou triplas para continuidade pedagógica.' },
            { key: 'theoryEarly', label: 'Matérias teóricas no início do dia', desc: 'Aloca aulas mais densas nos primeiros horários.' },
            { key: 'balanceWorkload', label: 'Balancear carga horária', desc: 'Tenta manter uma distribuição justa para todos os envolvidos.' }
          ].map(r => (
            <div 
              key={r.key} 
              onClick={() => toggle(r.key as any)}
              className={`p-6 rounded-3xl border-2 transition cursor-pointer flex items-center gap-4 ${rules[r.key as keyof AdvancedRules] ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-100 hover:border-slate-200'}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rules[r.key as keyof AdvancedRules] ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                {rules[r.key as keyof AdvancedRules] && <CheckCircle2 size={14} />}
              </div>
              <div>
                <div className={`font-bold text-sm ${rules[r.key as keyof AdvancedRules] ? 'text-indigo-900' : 'text-slate-700'}`}>{r.label}</div>
                <div className="text-[10px] text-slate-400">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-10">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Monitor size={18} /> Laboratórios & Práticas</h3>
            <p className="text-xs text-slate-500 italic mb-4">⚠️ Selecione apenas uma opção ou nenhuma.</p>
            <div className="space-y-4">
              <button 
                onClick={() => setRules({...rules, labRule: rules.labRule === 'avoidLast' ? 'none' : 'avoidLast'})}
                className={`w-full text-left p-6 rounded-2xl border-2 transition ${rules.labRule === 'avoidLast' ? 'bg-amber-50 border-amber-500 shadow-md' : 'bg-white border-slate-200 opacity-60'}`}
              >
                <div className="font-bold text-sm text-slate-800">🚫 Evitar labs/práticas no último horário</div>
                <div className="text-[10px] text-slate-400 mt-1">Não agendar atividades de laboratório no fim do expediente.</div>
              </button>
              <button 
                onClick={() => setRules({...rules, labRule: rules.labRule === 'prioritizeEnd' ? 'none' : 'prioritizeEnd'})}
                className={`w-full text-left p-6 rounded-2xl border-2 transition ${rules.labRule === 'prioritizeEnd' ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-slate-200 opacity-60'}`}
              >
                <div className="font-bold text-sm text-slate-800">📍 Priorizar labs/práticas nos horários finais</div>
                <div className="text-[10px] text-slate-400 mt-1">Tenta alocar estas aulas no final do período para conclusão de experimentos.</div>
              </button>
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-sm"><CheckCircle2 size={18} /> Continuidade</h3>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Máximo de aulas consecutivas</label>
              <input 
                type="number" min="1" max="4" 
                value={rules.maxConsecutive} 
                onChange={e => setRules({...rules, maxConsecutive: parseInt(e.target.value)})}
                className="w-full bg-indigo-800 border-indigo-700 p-4 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenerateStep: React.FC<{ teachers: Teacher[], groups: Group[], rooms: Room[], onGenerate: any, isGenerating: boolean, error: string | null }> = ({ teachers, groups, rooms, onGenerate, isGenerating, error }) => {
  return (
    <div className="text-center py-20 space-y-10">
      <div className="flex justify-center gap-10">
        <div className="text-center">
          <div className="text-4xl font-black text-indigo-600">{teachers.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professores</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-indigo-600">{groups.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Turmas</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-indigo-600">{rooms.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salas</div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-3xl font-bold">Resumo Final</h2>
        <p className="text-slate-500">Seus dados foram validados. A inteligência artificial está pronta para resolver o quebra-cabeça do seu calendário.</p>
        
        <button 
          onClick={onGenerate}
          disabled={isGenerating || teachers.length === 0 || groups.length === 0}
          className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-bold text-xl hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isGenerating ? "Processando..." : "Gerar Horário Automaticamente"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-medium border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

const ResultStep: React.FC<{ schedule: ScheduleSlot[], teachers: Teacher[], groups: Group[], rooms: Room[], subjects: Subject[], onBack: any, exportFull: any }> = ({ schedule, teachers, groups, rooms, subjects, onBack, exportFull }) => {
  const [viewMode, setViewMode] = useState<'group' | 'teacher'>('group');
  const [selectedId, setSelectedId] = useState(groups[0]?.id || '');

  const filtered = schedule.filter(s => viewMode === 'group' ? s.groupId === selectedId : s.teacherId === selectedId);
  const timeSlots = Array.from(new Set(schedule.map(s => s.startTime))).sort();

  return (
    <div className="space-y-8 animate-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => { setViewMode('group'); setSelectedId(groups[0]?.id || ''); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${viewMode === 'group' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Por Turma</button>
          <button onClick={() => { setViewMode('teacher'); setSelectedId(teachers[0]?.id || ''); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${viewMode === 'teacher' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Por Professor</button>
        </div>

        <div className="flex gap-4">
          <select 
            value={selectedId} onChange={e => setSelectedId(e.target.value)}
            className="p-2 border rounded-xl text-sm font-bold bg-white"
          >
            {(viewMode === 'group' ? groups : teachers).map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-slate-600">Ajustar Dados</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2.5rem] border border-slate-200 shadow-2xl bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-6 border-b border-r border-slate-200 text-slate-400 font-bold text-[10px] uppercase w-32">Horário</th>
              {WEEK_DAYS.filter(d => schedule.some(s => s.day === d)).map(day => (
                <th key={day} className="p-6 border-b border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} className="hover:bg-slate-50/30 transition">
                <td className="p-6 border-r border-slate-100 text-center font-black text-slate-300 text-sm bg-slate-50/50">{time}</td>
                {WEEK_DAYS.filter(d => schedule.some(s => s.day === d)).map(day => {
                  const slot = filtered.find(s => s.day === day && s.startTime === time);
                  if (!slot) return <td key={day} className="p-2 border-b border-slate-100"><div className="h-16 border-2 border-dashed border-slate-50 rounded-3xl" /></td>;
                  
                  if (slot.type === 'snack' || slot.type === 'lunch') {
                    return (
                      <td key={day} className="p-2 border-b border-slate-100">
                        <div className={`h-16 rounded-3xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest ${slot.type === 'snack' ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
                          {slot.type === 'snack' ? 'Lanche' : 'Almoço'}
                        </div>
                      </td>
                    );
                  }

                  const sub = subjects.find(x => x.id === slot.subjectId);
                  const teacher = teachers.find(x => x.id === slot.teacherId);
                  const room = rooms.find(x => x.id === slot.roomId);
                  const group = groups.find(x => x.id === slot.groupId);

                  return (
                    <td key={day} className="p-2 border-b border-slate-100 min-w-[140px]">
                      <div className="p-4 rounded-3xl shadow-lg shadow-indigo-50 border-t-4 transition hover:scale-105" style={{ backgroundColor: `${sub?.color}15`, borderTopColor: sub?.color }}>
                        <div className="font-black text-xs uppercase truncate" style={{ color: sub?.color }}>{sub?.name}</div>
                        <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase flex items-center gap-1">
                          {viewMode === 'group' ? <Users size={10} /> : <LayoutGrid size={10} />}
                          {viewMode === 'group' ? teacher?.name : group?.name}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase flex items-center gap-1"><Home size={10} /> {room?.name}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-4 py-8">
        <button onClick={exportFull} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
          <Download size={20} /> Exportar JSON Completo
        </button>
        <button onClick={() => window.print()} className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-900 transition shadow-xl shadow-slate-100">
          <Printer size={20} /> Salvar PDF
        </button>
      </div>
    </div>
  );
};

export default App;
