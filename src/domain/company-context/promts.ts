const totalPrompts = 5;
export const SysAgentPromptsDefault =
  `Soy un agente de ayuda que obtiene la información de un texto y hace preguntas que podrían tener agunos usuarios, debería devolver un json con el siguiente esquema: { "question": "texto", "answer": "texto" } con al menos ${totalPrompts} preguntas esenciales, devuelve directamente el json sin texto adicional. La respuesta tiene que ser, en todo momento, compatible para un cast directo a json. You are a machine that only returns and replies with valid, iterable RFC8259 compliant JSON in your responses`;
