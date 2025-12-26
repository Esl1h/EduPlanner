
import { GoogleGenAI, Type } from "@google/genai";
import { Teacher, Group, Room, BaseConfig, Subject, Workload, AdvancedRules, ScheduleSlot } from "../types";

export const generateScheduleAI = async (
  config: BaseConfig,
  rooms: Room[],
  subjects: Subject[],
  groups: Group[],
  teachers: Teacher[],
  workload: Workload,
  rules: AdvancedRules
): Promise<ScheduleSlot[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Você é um especialista em logística educacional. Gere uma grade horária escolar completa.
    
    CONFIGURAÇÕES: ${JSON.stringify(config)}
    SALAS: ${JSON.stringify(rooms)}
    MATÉRIAS: ${JSON.stringify(subjects)}
    TURMAS: ${JSON.stringify(groups)}
    PROFESSORES: ${JSON.stringify(teachers)}
    CARGA HORÁRIA: ${JSON.stringify(workload)}
    REGRAS AVANÇADAS: ${JSON.stringify(rules)}

    INSTRUÇÕES CRÍTICAS:
    1. Calcule os slots de tempo baseado na duração de aula (${config.classDuration}min).
    2. Respeite horários de lanche e almoço de cada turma (não agendar aulas neles).
    3. Respeite restrições de horários de professores.
    4. Respeite a regra de laboratório: ${rules.labRule}.
    5. Máximo de aulas consecutivas da mesma matéria: ${rules.maxConsecutive}.
    6. Retorne um array de objetos ScheduleSlot.

    RETORNO: EXCLUSIVAMENTE JSON conforme interface ScheduleSlot.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              teacherId: { type: Type.STRING },
              groupId: { type: Type.STRING },
              roomId: { type: Type.STRING },
              subjectId: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['class', 'snack', 'lunch'] }
            },
            required: ["day", "startTime", "endTime", "teacherId", "groupId", "roomId", "subjectId", "type"]
          }
        },
        thinkingConfig: { thinkingBudget: 32000 }
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Erro AI:", error);
    throw error;
  }
};
