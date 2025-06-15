import { z } from 'zod';

// Base QR Code configuration
export const QRConfigSchema = z.object({
  size: z.number().min(50).max(2000).default(300),
  margin: z.number().min(0).max(10).default(1),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  format: z.enum(['png', 'svg', 'pdf', 'jpeg']).default('png'),
});

// Enhanced styling options
export const QRStyleSchema = z.object({
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ffffff'),
  logoPath: z.string().optional(),
  logoSize: z.number().min(0.1).max(0.4).default(0.2),
  cornerRadius: z.number().min(0).max(50).default(0),
  dotStyle: z.enum(['square', 'round', 'diamond']).default('square'),
  gradientStart: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  gradientEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  borderWidth: z.number().min(0).max(20).default(0),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
});

// Content type schemas
export const VCardSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  organization: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const WiFiSchema = z.object({
  ssid: z.string(),
  password: z.string().optional(),
  security: z.enum(['WEP', 'WPA', 'WPA2', 'WPA3', 'nopass']).default('WPA2'),
  hidden: z.boolean().default(false),
});

export const EventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  allDay: z.boolean().default(false),
});

// Analysis schemas
export const QRAnalysisSchema = z.object({
  imagePath: z.string(),
  outputFormat: z.enum(['json', 'text']).default('json'),
});

// Batch generation schema
export const BatchQRSchema = z.object({
  items: z.array(z.object({
    content: z.string(),
    filename: z.string().optional(),
    style: QRStyleSchema.optional(),
  })),
  outputDir: z.string().default('./qr-codes'),
  format: z.enum(['png', 'svg', 'pdf']).default('png'),
  baseConfig: QRConfigSchema.optional(),
});

// Template schema
export const QRTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  style: QRStyleSchema,
  config: QRConfigSchema,
  category: z.enum(['business', 'personal', 'event', 'marketing', 'social']),
});

export type QRConfig = z.infer<typeof QRConfigSchema>;
export type QRStyle = z.infer<typeof QRStyleSchema>;
export type VCard = z.infer<typeof VCardSchema>;
export type WiFi = z.infer<typeof WiFiSchema>;
export type Event = z.infer<typeof EventSchema>;
export type QRAnalysis = z.infer<typeof QRAnalysisSchema>;
export type BatchQR = z.infer<typeof BatchQRSchema>;
export type QRTemplate = z.infer<typeof QRTemplateSchema>;

// Result types
export interface QRGenerationResult {
  success: boolean;
  filePath?: string;
  data?: Buffer | string;
  format: string;
  size: number;
  contentType: string;
  metadata?: {
    generatedAt: string;
    originalContent: string;
    estimatedSize: number;
  };
  error?: string;
}

export interface QRAnalysisResult {
  success: boolean;
  content?: string;
  format?: string;
  quality?: {
    score: number;
    readability: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
  metadata?: {
    version: number;
    errorCorrectionLevel: string;
    maskPattern: number;
    modules: number;
  };
  error?: string;
}

export interface QRStatistics {
  totalGenerated: number;
  byFormat: Record<string, number>;
  byTemplate: Record<string, number>;
  averageSize: number;
  averageGenerationTime: number;
  topContentTypes: Array<{ type: string; count: number }>;
  lastGenerated: string;
}

// Error types
export class QRError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'QRError';
  }
}

export class QRValidationError extends QRError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
  }
}

export class QRGenerationError extends QRError {
  constructor(message: string, details?: any) {
    super('GENERATION_ERROR', message, details);
  }
}

export class QRAnalysisError extends QRError {
  constructor(message: string, details?: any) {
    super('ANALYSIS_ERROR', message, details);
  }
}
