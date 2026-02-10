
import { GoogleGenAI, Type } from "@google/genai";
import { ProductIdea, SimilarityAnalysis, ImprovementSuggestion } from "../types";

// Fixed: Correct initialization with process.env.API_KEY as per guidelines.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface RefinedIdeaData {
  title: string;
  problem: string;
  solution: string;
  analysis: SimilarityAnalysis;
}

export const analyzeProductIdea = async (idea: ProductIdea): Promise<RefinedIdeaData> => {
  const ai = getAIClient();
  const prompt = `
    Extract and refine this product idea into a structured format and perform market analysis.
    
    Raw Idea Text: 
    """
    ${idea.rawIdea}
    """
    
    Current Features: ${idea.features.join(', ')}

    Your task:
    1. Create a professional and concise Title for the project.
    2. Extract the core Problem statement (the pain point).
    3. Extract the proposed Solution.
    4. Perform an internal search for similar existing products, SaaS, or open-source GitHub repositories.
    5. Evaluate them based on semantic similarity.
    
    Return a detailed JSON object with refined fields and the similarity analysis.
  `;

  // Note: googleSearch tool is removed here because it's incompatible with strict responseMimeType: "application/json".
  // Grounding results often prevent valid JSON generation or return non-JSON text.
  // Using gemini-3-pro-preview for complex analytical tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          problem: { type: Type.STRING },
          solution: { type: Type.STRING },
          analysis: {
            type: Type.OBJECT,
            properties: {
              competitors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    url: { type: Type.STRING },
                    similarityScore: { type: Type.NUMBER, description: "Scale 0 to 10" },
                    problem: { type: Type.STRING },
                    solution: { type: Type.STRING },
                    mainFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    relationToIdea: { type: Type.STRING }
                  },
                  required: ["name", "url", "similarityScore", "problem", "solution", "mainFeatures", "relationToIdea"]
                }
              },
              summary: { type: Type.STRING },
              differentiationFactor: { type: Type.STRING }
            },
            required: ["competitors", "summary", "differentiationFactor"]
          }
        },
        required: ["title", "problem", "solution", "analysis"]
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text.trim()) as RefinedIdeaData;
  } catch (e) {
    console.error("Failed to parse analysis JSON", e);
    throw new Error("Analysis failed");
  }
};

export const suggestImprovements = async (idea: ProductIdea, analysis: SimilarityAnalysis): Promise<ImprovementSuggestion[]> => {
  const ai = getAIClient();
  const prompt = `
    Based on the following product idea and its similarity analysis to competitors, suggest 5 high-impact improvements.
    Identify gaps in current competitors that this idea could fill, or strong features from competitors that should be adapted.

    Idea Title: ${idea.title}
    Refined Problem: ${idea.problem}
    Refined Solution: ${idea.solution}
    Analysis Summary: ${analysis.summary}
    Competitors: ${JSON.stringify(analysis.competitors)}
  `;

  // Using gemini-3-flash-preview for improvement suggestions (basic text task).
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['feature', 'strategic', 'technical'] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            sourceInspiration: { type: Type.STRING }
          },
          required: ["id", "type", "title", "description"]
        }
      }
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse improvements JSON", e);
    return [];
  }
};

export const generateSRS = async (idea: ProductIdea): Promise<string> => {
  const ai = getAIClient();
  const prompt = `
    Generate a full Software Requirements Specification (SRS) for the following product.
    Use a professional Markdown structure with:
    1. Introduction (Purpose, Document Conventions)
    2. Overall Description (Product Perspective, User Classes)
    3. External Interface Requirements
    4. System Features
    5. Other Nonfunctional Requirements

    Product Details:
    Title: ${idea.title}
    Problem: ${idea.problem}
    Solution: ${idea.solution}
    Final Features: ${idea.features.concat(idea.acceptedImprovements || []).join(', ')}

    The document should be highly detailed and professional.
  `;

  // Upgraded to gemini-3-pro-preview for complex document generation.
  // Using thinkingConfig to ensure high quality reasoning for technical specs.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text || "Failed to generate SRS";
};
