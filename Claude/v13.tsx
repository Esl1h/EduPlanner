import React, { useState } from 'react';
import { Calendar, Clock, Users, BookOpen, DoorOpen, Settings, Download, PlayCircle, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';

const TimetableApp = () => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    startTime: '07:00',
    endTime: '17:00',
    lessonDuration: 50,
    snackDuration: 15,
    lunchDuration: 60,
    workdays: [1, 2, 3, 4, 5],
    multipleSchedules: false
  });
  
  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [workload, setWorkload] = useState({});
  const [advancedRules, setAdvancedRules] = useState({
    avoidGaps: true,
    distributeEvenly: true,
    maxConsecutive: 2,
    avoidLabsLastSlot: false,
    prioritizeLabsEnd: false,
    groupSameSubject: false,
    preferMorningTheory: false,
    balanceTeacherLoad: true
  });
  
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [viewMode, setViewMode] = useState('class');
  const [selectedView, setSelectedView] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [showBanner, setShowBanner] = useState(true);

  const steps = [
    { id: 0, title: 'Configurações Básicas', icon: Settings },
    { id: 1, title: 'Salas', icon: DoorOpen },
    { id: 2, title: 'Matérias', icon: BookOpen },
    { id: 3, title: 'Turmas', icon: Users },
    { id: 4, title: 'Professores', icon: Users },
    { id: 5, title: 'Carga Horária', icon: Clock },
    { id: 6, title: 'Regras Avançadas', icon: Settings },
    { id: 7, title: 'Gerar Horário', icon: PlayCircle }
  ];

  const BasicConfig = () => {
    const [newSchedule, setNewSchedule] = useState({ name: '', startTime: '07:00', endTime: '17:00' });
    
    const addSchedule = () => {
      if (newSchedule.name && newSchedule.startTime && newSchedule.endTime) {
        setSchedules([...schedules, { ...newSchedule, id: Date.now() }]);
        setNewSchedule({ name: '', startTime: '07:00', endTime: '17:00' });
      }
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Configurações Básicas</h2>
        
        <div className="mb-6">
          <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={config.multipleSchedules}
              onChange={(e) => setConfig({...config, multipleSchedules: e.target.checked})}
              className="w-5 h-5"
            />
            <div>
              <span className="font-medium text-gray-800">Horários diferentes de turmas</span>
              <p className="text-sm text-gray-600">Permite cadastrar múltiplos horários</p>
            </div>
          </label>
        </div>
        
        {config.multipleSchedules ? (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Cadastro de Horários</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="Nome (ex: Matutino)" value={newSchedule.name} onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="time" value={newSchedule.startTime} onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="time" value={newSchedule.endTime} onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <button onClick={addSchedule} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Plus size={20} /> Adicionar Horário
              </button>
            </div>
            
            <div className="space-y-2">
              {schedules.map(schedule => (
                <div key={schedule.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div>
                    <span className="font-medium">{schedule.name}</span>
                    <span className="text-sm text-gray-600 ml-3">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  <button onClick={() => setSchedules(schedules.filter(s => s.id !== schedule.id))} className="text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entrada</label>
              <input type="time" value={config.startTime} onChange={(e) => setConfig({...config, startTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Saída</label>
              <input type="time" value={config.endTime} onChange={(e) => setConfig({...config, endTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duração Aula (min)</label>
            <input type="number" value={config.lessonDuration} onChange={(e) => setConfig({...config, lessonDuration: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lanche (min)</label>
            <input type="number" value={config.snackDuration} onChange={(e) => setConfig({...config, snackDuration: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Almoço (min)</label>
            <input type="number" value={config.lunchDuration} onChange={(e) => setConfig({...config, lunchDuration: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dias Letivos</label>
          <div className="flex gap-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
              <button key={idx} onClick={() => {
                const newDays = config.workdays.includes(idx + 1) ? config.workdays.filter(d => d !== idx + 1) : [...config.workdays, idx + 1].sort();
                setConfig({...config, workdays: newDays});
              }} className={`px-4 py-2 rounded-lg ${config.workdays.includes(idx + 1) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const RoomsConfig = () => {
    const [newRoom, setNewRoom] = useState({ name: '', type: 'regular', capacity: 30 });
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Salas</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="Nome" value={newRoom.name} onChange={(e) => setNewRoom({...newRoom, name: e.target.value})} className="px-3 py-2 border rounded-lg" />
            <select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} className="px-3 py-2 border rounded-lg">
              <option value="regular">Regular</option>
              <option value="lab">Laboratório</option>
              <option value="gym">Quadra</option>
            </select>
            <input type="number" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} className="px-3 py-2 border rounded-lg" />
          </div>
          <button onClick={() => { if(newRoom.name) { setRooms([...rooms, {...newRoom, id: Date.now()}]); setNewRoom({name: '', type: 'regular', capacity: 30}); }}} className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus size={20} /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {rooms.map(room => (
            <div key={room.id} className="flex justify-between bg-white p-3 rounded-lg border">
              <span>{room.name} - {room.type}</span>
              <button onClick={() => setRooms(rooms.filter(r => r.id !== room.id))} className="text-red-600"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SubjectsConfig = () => {
    const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6', type: 'theory' });
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Matérias</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Nome" value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})} className="px-3 py-2 border rounded-lg" />
            <select value={newSubject.type} onChange={(e) => setNewSubject({...newSubject, type: e.target.value})} className="px-3 py-2 border rounded-lg">
              <option value="theory">Teórica</option>
              <option value="practice">Prática</option>
              <option value="lab">Laboratório</option>
            </select>
          </div>
          <div className="flex gap-2">
            {colors.map(color => (
              <button key={color} onClick={() => setNewSubject({...newSubject, color})} className="w-10 h-10 rounded-lg border-2" style={{backgroundColor: color, borderColor: newSubject.color === color ? '#000' : '#ccc'}} />
            ))}
          </div>
          <button onClick={() => { if(newSubject.name) { setSubjects([...subjects, {...newSubject, id: Date.now()}]); setNewSubject({name: '', color: '#3B82F6', type: 'theory'}); }}} className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus size={20} /> Adicionar
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map(subject => (
            <div key={subject.id} className="flex justify-between bg-white p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{backgroundColor: subject.color}} />
                <span>{subject.name}</span>
              </div>
              <button onClick={() => setSubjects(subjects.filter(s => s.id !== subject.id))} className="text-red-600"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ClassesConfig = () => {
    const [newClass, setNewClass] = useState({ name: '', label: 'fund1', shift: 'morning', snackTime: '09:30', lunchTime: '12:00', scheduleId: null });
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Turmas</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="Nome" value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} className="px-3 py-2 border rounded-lg" />
            <select value={newClass.label} onChange={(e) => setNewClass({...newClass, label: e.target.value})} className="px-3 py-2 border rounded-lg">
              <option value="fund1">Fund. I</option>
              <option value="fund2">Fund. II</option>
              <option value="medio">Médio</option>
            </select>
            <select value={newClass.shift} onChange={(e) => setNewClass({...newClass, shift: e.target.value})} className="px-3 py-2 border rounded-lg">
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
            </select>
          </div>
          
          {config.multipleSchedules && schedules.length > 0 && (
            <select value={newClass.scheduleId || ''} onChange={(e) => setNewClass({...newClass, scheduleId: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Selecione horário</option>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={newClass.snackTime} onChange={(e) => setNewClass({...newClass, snackTime: e.target.value})} className="px-3 py-2 border rounded-lg" placeholder="Lanche" />
            <input type="time" value={newClass.lunchTime} onChange={(e) => setNewClass({...newClass, lunchTime: e.target.value})} className="px-3 py-2 border rounded-lg" placeholder="Almoço" />
          </div>
          
          <button onClick={() => { if(newClass.name) { setClasses([...classes, {...newClass, id: Date.now()}]); setNewClass({name: '', label: 'fund1', shift: 'morning', snackTime: '09:30', lunchTime: '12:00', scheduleId: null}); }}} className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus size={20} /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {classes.map(cls => (
            <div key={cls.id} className="flex justify-between bg-white p-3 rounded-lg border">
              <span>{cls.name}</span>
              <button onClick={() => setClasses(classes.filter(c => c.id !== cls.id))} className="text-red-600"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TeachersConfig = () => {
    const [newTeacher, setNewTeacher] = useState({ name: '', subjects: [], fullyAvailable: true, restrictions: [] });
    const [newRestriction, setNewRestriction] = useState({ days: [], startTime: '07:00', endTime: '12:00' });
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Professores</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <input type="text" placeholder="Nome" value={newTeacher.name} onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          
          <div>
            <label className="block text-sm font-medium mb-2">Matérias:</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button key={subject.id} onClick={() => {
                  const subs = newTeacher.subjects.includes(subject.id) ? newTeacher.subjects.filter(s => s !== subject.id) : [...newTeacher.subjects, subject.id];
                  setNewTeacher({...newTeacher, subjects: subs});
                }} className="px-3 py-1 rounded text-sm" style={{backgroundColor: newTeacher.subjects.includes(subject.id) ? subject.color : '#e5e7eb', color: newTeacher.subjects.includes(subject.id) ? '#fff' : '#000'}}>
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <input type="checkbox" checked={newTeacher.fullyAvailable} onChange={(e) => setNewTeacher({...newTeacher, fullyAvailable: e.target.checked, restrictions: []})} className="w-5 h-5" />
            <span className="font-medium">✓ 100% disponível</span>
          </label>
          
          {!newTeacher.fullyAvailable && (
            <div className="space-y-3 border-t pt-3">
              <h4 className="font-medium">Restrições</h4>
              <div className="bg-white p-3 rounded border space-y-2">
                <div className="flex gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((day, idx) => (
                    <button key={idx} onClick={() => {
                      const days = newRestriction.days.includes(idx + 1) ? newRestriction.days.filter(d => d !== idx + 1) : [...newRestriction.days, idx + 1];
                      setNewRestriction({...newRestriction, days});
                    }} className={`px-2 py-1 rounded text-sm ${newRestriction.days.includes(idx + 1) ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                      {day}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" value={newRestriction.startTime} onChange={(e) => setNewRestriction({...newRestriction, startTime: e.target.value})} className="px-2 py-1 border rounded" />
                  <input type="time" value={newRestriction.endTime} onChange={(e) => setNewRestriction({...newRestriction, endTime: e.target.value})} className="px-2 py-1 border rounded" />
                </div>
                <button onClick={() => {
                  if(newRestriction.days.length > 0) {
                    setNewTeacher({...newTeacher, restrictions: [...newTeacher.restrictions, {...newRestriction, id: Date.now()}]});
                    setNewRestriction({days: [], startTime: '07:00', endTime: '12:00'});
                  }
                }} className="w-full bg-red-600 text-white py-1 rounded text-sm">
                  Adicionar Restrição
                </button>
              </div>
              {newTeacher.restrictions.map(r => (
                <div key={r.id} className="flex justify-between bg-red-50 p-2 rounded text-sm">
                  <span>{r.days.map(d => ['Seg','Ter','Qua','Qui','Sex','Sáb'][d-1]).join(', ')} {r.startTime}-{r.endTime}</span>
                  <button onClick={() => setNewTeacher({...newTeacher, restrictions: newTeacher.restrictions.filter(re => re.id !== r.id)})}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
          
          <button onClick={() => { if(newTeacher.name && newTeacher.subjects.length > 0) { setTeachers([...teachers, {...newTeacher, id: Date.now()}]); setNewTeacher({name: '', subjects: [], fullyAvailable: true, restrictions: []}); }}} className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus size={20} /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {teachers.map(t => (
            <div key={t.id} className="bg-white p-3 rounded border">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{t.name}</span>
                <button onClick={() => setTeachers(teachers.filter(te => te.id !== t.id))} className="text-red-600"><Trash2 size={18} /></button>
              </div>
              <div className="text-xs text-gray-600">
                {t.fullyAvailable ? '✓ 100% disponível' : `⚠️ ${t.restrictions.length} restrições`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WorkloadConfig = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Carga Horária</h2>
      <p className="text-gray-600">Defina quantas aulas por semana cada turma terá de cada matéria</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Turma</th>
              {subjects.map(s => <th key={s.id} className="border p-2">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id}>
                <td className="border p-2 font-medium">{cls.name}</td>
                {subjects.map(sub => (
                  <td key={sub.id} className="border p-2">
                    <input type="number" min="0" max="10" value={workload[`${cls.id}-${sub.id}`] || 0} onChange={(e) => setWorkload({...workload, [`${cls.id}-${sub.id}`]: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 border rounded text-center" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdvancedRulesConfig = () => {
    const handleLabRule = (rule) => {
      if (rule === 'avoid') {
        setAdvancedRules({...advancedRules, avoidLabsLastSlot: !advancedRules.avoidLabsLastSlot, prioritizeLabsEnd: false});
      } else {
        setAdvancedRules({...advancedRules, prioritizeLabsEnd: !advancedRules.prioritizeLabsEnd, avoidLabsLastSlot: false});
      }
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Regras Avançadas</h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={advancedRules.avoidGaps} onChange={(e) => setAdvancedRules({...advancedRules, avoidGaps: e.target.checked})} className="w-5 h-5" />
            <span>Evitar janelas para professores</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={advancedRules.distributeEvenly} onChange={(e) => setAdvancedRules({...advancedRules, distributeEvenly: e.target.checked})} className="w-5 h-5" />
            <span>Distribuir uniformemente na semana</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={advancedRules.groupSameSubject} onChange={(e) => setAdvancedRules({...advancedRules, groupSameSubject: e.target.checked})} className="w-5 h-5" />
            <span>Agrupar mesma matéria (aulas duplas)</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={advancedRules.preferMorningTheory} onChange={(e) => setAdvancedRules({...advancedRules, preferMorningTheory: e.target.checked})} className="w-5 h-5" />
            <span>Teoria no início do dia</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={advancedRules.balanceTeacherLoad} onChange={(e) => setAdvancedRules({...advancedRules, balanceTeacherLoad: e.target.checked})} className="w-5 h-5" />
            <span>Balancear carga de professores</span>
          </label>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Labs e Aulas Práticas</h3>
          <p className="text-sm text-gray-600 mb-3">Selecione apenas uma ou nenhuma:</p>
          
          <label className="flex items-center gap-3 p-3 rounded-lg border-2 mb-2" style={{borderColor: advancedRules.avoidLabsLastSlot ? '#9333ea' : '#e5e7eb'}}>
            <input type="checkbox" checked={advancedRules.avoidLabsLastSlot} onChange={() => handleLabRule('avoid')} className="w-5 h-5" />
            <span>🚫 Evitar labs no último horário</span>
          </label>
          
          <label className="flex items-center gap-3 p-3 rounded-lg border-2" style={{borderColor: advancedRules.prioritizeLabsEnd ? '#9333ea' : '#e5e7eb'}}>
            <input type="checkbox" checked={advancedRules.prioritizeLabsEnd} onChange={() => handleLabRule('prioritize')} className="w-5 h-5" />
            <span>📍 Priorizar labs no final</span>
          </label>
        </div>
        
        <div>
          <label className="block font-medium mb-2">Máximo de aulas consecutivas da mesma matéria</label>
          <input type="number" min="1" max="4" value={advancedRules.maxConsecutive} onChange={(e) => setAdvancedRules({...advancedRules, maxConsecutive: parseInt(e.target.value)})} className="w-32 px-3 py-2 border rounded-lg" />
        </div>
      </div>
    );
  };

  const GenerateStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerar Horário</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium mb-2">Resumo</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>📚 {subjects.length} matérias</div>
          <div>👥 {teachers.length} professores</div>
          <div>🏫 {classes.length} turmas</div>
          <div>🚪 {rooms.length} salas</div>
        </div>
      </div>
      <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-lg font-medium">
        <PlayCircle size={24} /> Gerar Horário (em desenvolvimento)
      </button>
      <p className="text-center text-gray-500 text-sm">Funcionalidade de geração em construção</p>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 0: return <BasicConfig />;
      case 1: return <RoomsConfig />;
      case 2: return <SubjectsConfig />;
      case 3: return <ClassesConfig />;
      case 4: return <TeachersConfig />;
      case 5: return <WorkloadConfig />;
      case 6: return <AdvancedRulesConfig />;
      case 7: return <GenerateStep />;
      default: return <BasicConfig />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {showBanner && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm md:text-base">
                  ✨ <strong>Quer ter este app 100% personalizado?</strong> Contato via{' '}
                  <a href="https://esli.cafe" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-yellow-300">
                    https://esli.cafe
                  </a>
                  {' '}- {' '}
                  <a href="https://claude.ai/public/artifacts/1e75a0a7-d0c9-432e-aea9-5fadd895ecef" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
                    Artifact (Claude)
                  </a>
                  {' '}|{' '}
                  <a href="https://ai.studio/apps/drive/1h8oBg88FzoMtj7l6CPTHwn67k2iGS59q" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
                    Google Studio (Gemini)
                  </a>
                </p>
              </div>
              <button onClick={() => setShowBanner(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">EduPlanner AI</h1>
          </div>
          <p className="text-gray-600">Sistema completo para criação e gerenciamento de horários e calendário escolar</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === idx;
              const isCompleted = step > idx;
              
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <button onClick={() => setStep(idx)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white scale-110' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                    </button>
                    <span className={`text-xs mt-2 text-center ${isActive ? 'font-bold' : ''}`}>{s.title}</span>
                  </div>
                  {idx < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {renderStep()}
        </div>

        <div className="flex justify-between gap-4">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            ← Anterior
          </button>
          
          {step < steps.length - 1 && (
            <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Próximo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableApp;