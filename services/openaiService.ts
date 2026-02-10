import OpenAI from 'openai';
import { ProductIdea, SimilarityAnalysis, ImprovementSuggestion } from '../types';
import { createLogger } from './logger';

const log = createLogger('OpenAIService');

const getAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log.error('OPENAI_API_KEY is not set. AI features will not work.');
  }
  return new OpenAI({
    apiKey: apiKey as string,
    dangerouslyAllowBrowser: true,
  });
};

export interface RefinedIdeaData {
  title: string;
  problem: string;
  solution: string;
  analysis: SimilarityAnalysis;
}

// ── JSON Schemas for Structured Outputs ─────────────────────────────────

const refinedIdeaSchema = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    problem: { type: "string" as const },
    solution: { type: "string" as const },
    analysis: {
      type: "object" as const,
      properties: {
        competitors: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: {
              name: { type: "string" as const },
              url: { type: "string" as const },
              similarityScore: { type: "number" as const },
              problem: { type: "string" as const },
              solution: { type: "string" as const },
              mainFeatures: { type: "array" as const, items: { type: "string" as const } },
              relationToIdea: { type: "string" as const },
            },
            required: ["name", "url", "similarityScore", "problem", "solution", "mainFeatures", "relationToIdea"],
            additionalProperties: false,
          },
        },
        summary: { type: "string" as const },
        differentiationFactor: { type: "string" as const },
      },
      required: ["competitors", "summary", "differentiationFactor"],
      additionalProperties: false,
    },
  },
  required: ["title", "problem", "solution", "analysis"],
  additionalProperties: false,
};

const improvementsSchema = {
  type: "object" as const,
  properties: {
    suggestions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          id: { type: "string" as const },
          type: { type: "string" as const, enum: ["feature", "strategic", "technical"] },
          title: { type: "string" as const },
          description: { type: "string" as const },
          sourceInspiration: { type: "string" as const },
        },
        required: ["id", "type", "title", "description", "sourceInspiration"],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

// ── Step 1: Web Research (Responses API + web_search_preview) ───────────

const performWebResearch = async (client: OpenAI, idea: ProductIdea): Promise<string> => {
  log.info('Step 1: Performing live web research for competitors...', { ideaId: idea.id });

  const researchPrompt = `
    You are a market research analyst. Search the web to find real competitors, similar SaaS products, 
    and open-source GitHub repositories related to this product idea.

    Product Idea:
    """
    ${idea.rawIdea}
    """
    Current Features: ${idea.features.join(', ')}

    For each competitor or similar product you find:
    - Provide the exact product/project name
    - Provide the real, working URL
    - Describe what problem they solve
    - Describe their solution approach
    - List their main features
    - Explain how they relate to this idea
    - Rate semantic similarity on a 0-10 scale

    Find at least 3-5 real competitors. Be thorough and accurate.
    Also provide an overall market summary and what would differentiate this idea.
  `;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: researchPrompt,
    tools: [{ type: 'web_search_preview', search_context_size: 'high' }],
  });

  const researchText = response.output_text || '';
  log.info(`Web research completed (${researchText.length} chars).`, { ideaId: idea.id });
  return researchText;
};

// ── Step 2: Structure Research into JSON (Chat Completions + JSON Schema) ─

const structureAnalysis = async (
  client: OpenAI,
  idea: ProductIdea,
  researchText: string
): Promise<RefinedIdeaData> => {
  log.info('Step 2: Structuring research into analysis JSON...', { ideaId: idea.id });

  const structurePrompt = `
    Based on the following web research about competitors and market analysis, 
    create a structured analysis of this product idea.

    Original Idea:
    """
    ${idea.rawIdea}
    """
    Current Features: ${idea.features.join(', ')}

    Web Research Results:
    """
    ${researchText}
    """

    Your task:
    1. Create a professional and concise Title for the project.
    2. Extract the core Problem statement (the pain point).
    3. Extract the proposed Solution.
    4. Structure the competitor data from the research into the required format.
    5. Ensure all URLs are real links found in the research.
    6. Provide a market summary and differentiation factor.
  `;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product strategist. Structure the provided web research into a precise JSON format. Keep all real URLs and factual data from the research intact.',
      },
      { role: 'user', content: structurePrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'refined_idea_analysis',
        strict: true,
        schema: refinedIdeaSchema,
      },
    },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text.trim()) as RefinedIdeaData;
};

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Analyzes a product idea using a two-step pipeline:
 *   Step 1 → Live web search via OpenAI Responses API (gpt-4o + web_search_preview)
 *   Step 2 → Structure into JSON via Chat Completions API (gpt-4o-mini + json_schema)
 */
export const analyzeProductIdea = async (idea: ProductIdea): Promise<RefinedIdeaData> => {
  log.info('Starting product idea analysis with live web search...', { ideaId: idea.id, title: idea.title });
  const client = getAIClient();

  try {
    // Step 1: Live web research
    const researchText = await performWebResearch(client, idea);

    // Step 2: Structure into JSON
    const parsed = await structureAnalysis(client, idea, researchText);

    log.info('Analysis completed with web-grounded data.', {
      ideaId: idea.id,
      refinedTitle: parsed.title,
      competitorCount: parsed.analysis.competitors.length,
    });
    return parsed;
  } catch (e) {
    log.error('Two-step analysis failed, attempting single-call fallback...', e);

    // Fallback: single call without web search (same as old Gemini behaviour)
    return await fallbackAnalysis(client, idea);
  }
};

/**
 * Fallback analysis without web search (training-data only, like the original Gemini implementation).
 */
const fallbackAnalysis = async (client: OpenAI, idea: ProductIdea): Promise<RefinedIdeaData> => {
  log.info('Running fallback analysis (no web search)...', { ideaId: idea.id });

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
    4. Search your knowledge for similar existing products, SaaS, or open-source GitHub repositories.
    5. Evaluate them based on semantic similarity (0-10 scale).
    
    Return a detailed JSON object with refined fields and the similarity analysis.
  `;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a product strategist and market analyst. Provide thorough competitive analysis.' },
      { role: 'user', content: prompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'refined_idea_analysis',
        strict: true,
        schema: refinedIdeaSchema,
      },
    },
  });

  try {
    const text = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text.trim()) as RefinedIdeaData;
    log.info('Fallback analysis completed.', {
      ideaId: idea.id,
      refinedTitle: parsed.title,
      competitorCount: parsed.analysis.competitors.length,
    });
    return parsed;
  } catch (e) {
    log.error('Failed to parse fallback analysis JSON response.', e);
    throw new Error("Analysis failed — invalid AI response.");
  }
};

/**
 * Generates 5 high-impact improvement suggestions based on competitive analysis.
 * Uses gpt-4o-mini with strict JSON schema output.
 */
export const suggestImprovements = async (
  idea: ProductIdea,
  analysis: SimilarityAnalysis
): Promise<ImprovementSuggestion[]> => {
  log.info('Generating improvement suggestions...', { ideaId: idea.id, title: idea.title });
  const client = getAIClient();

  const prompt = `
    Based on the following product idea and its similarity analysis to competitors, suggest 5 high-impact improvements.
    Identify gaps in current competitors that this idea could fill, or strong features from competitors that should be adapted.

    Idea Title: ${idea.title}
    Refined Problem: ${idea.problem}
    Refined Solution: ${idea.solution}
    Analysis Summary: ${analysis.summary}
    Competitors: ${JSON.stringify(analysis.competitors)}
  `;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product innovation expert. Suggest actionable improvements based on competitive analysis.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'improvement_suggestions',
        strict: true,
        schema: improvementsSchema,
      },
    },
  });

  try {
    const text = response.choices[0]?.message?.content || '{"suggestions":[]}';
    const parsed = JSON.parse(text.trim()) as { suggestions: ImprovementSuggestion[] };
    log.info(`Generated ${parsed.suggestions.length} improvement suggestions.`, { ideaId: idea.id });
    return parsed.suggestions;
  } catch (e) {
    log.error('Failed to parse improvements JSON response.', e);
    return [];
  }
};

/**
 * Generates a full SRS document using o3-mini with high reasoning effort.
 * Equivalent to Gemini's thinkingConfig: { thinkingBudget: 2000 }.
 */
export const generateSRS = async (idea: ProductIdea): Promise<string> => {
  log.info('Generating SRS document with deep reasoning...', { ideaId: idea.id, title: idea.title });
  const client = getAIClient();

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

  // Using o3-mini with high reasoning effort for complex document generation.
  const response = await client.chat.completions.create({
    model: 'o3-mini',
    messages: [
      {
        role: 'developer',
        content: 'You are a senior software architect. Generate thorough, professional SRS documents in Markdown format.',
      },
      { role: 'user', content: prompt },
    ],
    reasoning_effort: 'high',
  });

  const srs = response.choices[0]?.message?.content || '';
  if (!srs) {
    log.error('SRS generation returned empty content.', { ideaId: idea.id });
    throw new Error("Failed to generate SRS — empty response.");
  }

  log.info(`SRS generated successfully (${srs.length} chars).`, { ideaId: idea.id });
  return srs;
};

