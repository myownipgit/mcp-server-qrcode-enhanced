#!/usr/bin/env node

/**
 * Enhanced QR Code MCP Server
 * 
 * Built upon the excellent foundation of @jwalsh/mcp-server-qrcode
 * with advanced features for QR code generation, styling, and analysis.
 * 
 * @author Enhanced by Claude, originally inspired by @jwalsh
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { QRCodeEnhanced } from './qr-utils.js';
import {
  QRConfigSchema,
  QRStyleSchema,
  VCardSchema,
  WiFiSchema,
  EventSchema,
  QRAnalysisSchema,
  BatchQRSchema,
  QRValidationError,
  QRGenerationError,
  QRAnalysisError,
} from './types.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

class EnhancedQRCodeMCPServer {
  private server: Server;
  private qrCode: QRCodeEnhanced;

  constructor() {
    this.server = new Server(
      {
        name: 'enhanced-qrcode-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.qrCode = new QRCodeEnhanced();
    this.setupRequestHandlers();
  }

  private setupRequestHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Basic QR code generation (compatible with original)
          case 'generate_qr_basic':
            return await this.handleGenerateBasic(args);

          // Enhanced QR code generation
          case 'generate_qr_styled':
            return await this.handleGenerateStyled(args);

          case 'generate_qr_batch':
            return await this.handleGenerateBatch(args);

          // Specialized QR code types
          case 'generate_vcard_qr':
            return await this.handleGenerateVCard(args);

          case 'generate_wifi_qr':
            return await this.handleGenerateWiFi(args);

          case 'generate_event_qr':
            return await this.handleGenerateEvent(args);

          // Analysis and processing
          case 'decode_qr_image':
            return await this.handleDecodeQR(args);

          case 'analyze_qr_quality':
            return await this.handleAnalyzeQuality(args);

          case 'optimize_qr_content':
            return await this.handleOptimizeContent(args);

          // Templates and utilities
          case 'list_qr_templates':
            return await this.handleListTemplates(args);

          case 'generate_qr_from_template':
            return await this.handleGenerateFromTemplate(args);

          case 'get_qr_statistics':
            return await this.handleGetStatistics(args);

          case 'validate_qr_content':
            return await this.handleValidateContent(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorType = error instanceof QRValidationError ? 'ValidationError' :
                         error instanceof QRGenerationError ? 'GenerationError' :
                         error instanceof QRAnalysisError ? 'AnalysisError' : 'UnknownError';

        return {
          content: [
            {
              type: 'text',
              text: `Error (${errorType}): ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      // Basic QR code generation (maintains compatibility)
      {
        name: 'generate_qr_basic',
        description: 'Generate a basic QR code (compatible with original @jwalsh/mcp-server-qrcode)',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to encode in the QR code',
            },
            size: {
              type: 'number',
              description: 'Size of the QR code in pixels (default: 300)',
              default: 300,
            },
            margin: {
              type: 'number',
              description: 'Margin around the QR code (default: 1)',
              default: 1,
            },
            errorCorrectionLevel: {
              type: 'string',
              enum: ['L', 'M', 'Q', 'H'],
              description: 'Error correction level (default: M)',
              default: 'M',
            },
            format: {
              type: 'string',
              enum: ['png', 'svg', 'pdf', 'jpeg'],
              description: 'Output format (default: png)',
              default: 'png',
            },
          },
          required: ['content'],
        },
      },

      // Enhanced QR code generation
      {
        name: 'generate_qr_styled',
        description: 'Generate a QR code with custom styling and advanced features',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to encode in the QR code',
            },
            style: {
              type: 'object',
              description: 'Styling options for the QR code',
              properties: {
                foregroundColor: {
                  type: 'string',
                  description: 'Foreground color (hex format, e.g., #000000)',
                  default: '#000000',
                },
                backgroundColor: {
                  type: 'string',
                  description: 'Background color (hex format, e.g., #ffffff)',
                  default: '#ffffff',
                },
                logoPath: {
                  type: 'string',
                  description: 'Path to logo image to embed in QR code',
                },
                logoSize: {
                  type: 'number',
                  description: 'Logo size as fraction of QR code (0.1-0.4)',
                  default: 0.2,
                },
                cornerRadius: {
                  type: 'number',
                  description: 'Corner radius for rounded QR code',
                  default: 0,
                },
                dotStyle: {
                  type: 'string',
                  enum: ['square', 'round', 'diamond'],
                  description: 'Style of QR code dots',
                  default: 'square',
                },
                borderWidth: {
                  type: 'number',
                  description: 'Width of border around QR code',
                  default: 0,
                },
                borderColor: {
                  type: 'string',
                  description: 'Color of border (hex format)',
                  default: '#000000',
                },
              },
            },
            config: {
              type: 'object',
              description: 'Basic QR code configuration',
              properties: {
                size: { type: 'number', default: 300 },
                margin: { type: 'number', default: 1 },
                errorCorrectionLevel: {
                  type: 'string',
                  enum: ['L', 'M', 'Q', 'H'],
                  default: 'M',
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg', 'pdf', 'jpeg'],
                  default: 'png',
                },
              },
            },
          },
          required: ['content'],
        },
      },

      // vCard QR code
      {
        name: 'generate_vcard_qr',
        description: 'Generate a QR code containing vCard contact information',
        inputSchema: {
          type: 'object',
          properties: {
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            organization: { type: 'string', description: 'Organization/Company' },
            title: { type: 'string', description: 'Job title' },
            phone: { type: 'string', description: 'Phone number' },
            email: { type: 'string', description: 'Email address' },
            website: { type: 'string', description: 'Website URL' },
            address: {
              type: 'object',
              description: 'Address information',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip: { type: 'string' },
                country: { type: 'string' },
              },
            },
            config: {
              type: 'object',
              description: 'QR code configuration',
              properties: {
                size: { type: 'number', default: 300 },
                format: { type: 'string', enum: ['png', 'svg'], default: 'png' },
              },
            },
          },
          required: ['firstName', 'lastName'],
        },
      },

      // WiFi QR code
      {
        name: 'generate_wifi_qr',
        description: 'Generate a QR code for WiFi network credentials',
        inputSchema: {
          type: 'object',
          properties: {
            ssid: { type: 'string', description: 'WiFi network name' },
            password: { type: 'string', description: 'WiFi password' },
            security: {
              type: 'string',
              enum: ['WEP', 'WPA', 'WPA2', 'WPA3', 'nopass'],
              description: 'Security type',
              default: 'WPA2',
            },
            hidden: {
              type: 'boolean',
              description: 'Whether the network is hidden',
              default: false,
            },
            config: {
              type: 'object',
              description: 'QR code configuration',
              properties: {
                size: { type: 'number', default: 300 },
                format: { type: 'string', enum: ['png', 'svg'], default: 'png' },
              },
            },
          },
          required: ['ssid'],
        },
      },

      // Event QR code
      {
        name: 'generate_event_qr',
        description: 'Generate a QR code for calendar event',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Event title' },
            description: { type: 'string', description: 'Event description' },
            location: { type: 'string', description: 'Event location' },
            startDate: { type: 'string', description: 'Start date (ISO format)' },
            endDate: { type: 'string', description: 'End date (ISO format)' },
            allDay: { type: 'boolean', description: 'All day event', default: false },
            config: {
              type: 'object',
              description: 'QR code configuration',
              properties: {
                size: { type: 'number', default: 300 },
                format: { type: 'string', enum: ['png', 'svg'], default: 'png' },
              },
            },
          },
          required: ['title', 'startDate'],
        },
      },

      // QR code analysis
      {
        name: 'decode_qr_image',
        description: 'Decode QR code from an image file',
        inputSchema: {
          type: 'object',
          properties: {
            imagePath: {
              type: 'string',
              description: 'Path to the image file containing QR code',
            },
            outputFormat: {
              type: 'string',
              enum: ['json', 'text'],
              description: 'Output format for decoded content',
              default: 'json',
            },
          },
          required: ['imagePath'],
        },
      },

      // Quality analysis
      {
        name: 'analyze_qr_quality',
        description: 'Analyze QR code quality and provide optimization recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            imagePath: {
              type: 'string',
              description: 'Path to the QR code image to analyze',
            },
          },
          required: ['imagePath'],
        },
      },

      // Templates
      {
        name: 'list_qr_templates',
        description: 'List available QR code templates',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      {
        name: 'generate_qr_from_template',
        description: 'Generate QR code using a predefined template',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Content to encode' },
            templateName: { type: 'string', description: 'Template name to use' },
            overrides: {
              type: 'object',
              description: 'Style and config overrides',
            },
          },
          required: ['content', 'templateName'],
        },
      },

      // Statistics
      {
        name: 'get_qr_statistics',
        description: 'Get usage statistics and performance metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // Content validation
      {
        name: 'validate_qr_content',
        description: 'Validate content before QR code generation',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Content to validate' },
            contentType: {
              type: 'string',
              enum: ['url', 'text', 'email', 'phone', 'wifi', 'vcard'],
              description: 'Expected content type',
              default: 'text',
            },
          },
          required: ['content'],
        },
      },

      // Batch generation
      {
        name: 'generate_qr_batch',
        description: 'Generate multiple QR codes in batch',
        inputSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              description: 'Array of QR code items to generate',
              items: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  filename: { type: 'string' },
                  style: { type: 'object' },
                },
                required: ['content'],
              },
            },
            outputDir: {
              type: 'string',
              description: 'Output directory for generated files',
              default: './qr-codes',
            },
            format: {
              type: 'string',
              enum: ['png', 'svg', 'pdf'],
              description: 'Output format for all QR codes',
              default: 'png',
            },
          },
          required: ['items'],
        },
      },

      // Content optimization
      {
        name: 'optimize_qr_content',
        description: 'Optimize content for better QR code generation',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Content to optimize' },
            targetSize: {
              type: 'number',
              description: 'Target QR code size for optimization',
              default: 300,
            },
          },
          required: ['content'],
        },
      },
    ];
  }

  // Tool handlers

  private async handleGenerateBasic(args: any) {
    const validation = QRConfigSchema.safeParse(args);
    if (!validation.success) {
      throw new QRValidationError('Invalid basic QR configuration', validation.error);
    }

    const result = await this.qrCode.generateBasic(args.content, validation.data);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Basic QR code generated successfully!\n\n` +
                `📁 File: ${result.filePath}\n` +
                `📏 Size: ${result.size} bytes\n` +
                `🔧 Format: ${result.format}\n` +
                `⏰ Generated: ${result.metadata?.generatedAt}`,
        },
      ],
    };
  }

  private async handleGenerateStyled(args: any) {
    const result = await this.qrCode.generateStyled(
      args.content,
      args.style || {},
      args.config || {}
    );
    
    return {
      content: [
        {
          type: 'text',
          text: `🎨 Styled QR code generated successfully!\n\n` +
                `📁 File: ${result.filePath}\n` +
                `📏 Size: ${result.size} bytes\n` +
                `🔧 Format: ${result.format}\n` +
                `⏰ Generated: ${result.metadata?.generatedAt}`,
        },
      ],
    };
  }

  private async handleGenerateVCard(args: any) {
    const validation = VCardSchema.safeParse(args);
    if (!validation.success) {
      throw new QRValidationError('Invalid vCard data', validation.error);
    }

    const result = await this.qrCode.generateVCard(validation.data, args.config || {});
    
    return {
      content: [
        {
          type: 'text',
          text: `👤 vCard QR code generated successfully!\n\n` +
                `📁 File: ${result.filePath}\n` +
                `👤 Contact: ${args.firstName} ${args.lastName}\n` +
                `📏 Size: ${result.size} bytes`,
        },
      ],
    };
  }

  private async handleGenerateWiFi(args: any) {
    const validation = WiFiSchema.safeParse(args);
    if (!validation.success) {
      throw new QRValidationError('Invalid WiFi data', validation.error);
    }

    const result = await this.qrCode.generateWiFi(validation.data, args.config || {});
    
    return {
      content: [
        {
          type: 'text',
          text: `📶 WiFi QR code generated successfully!\n\n` +
                `📁 File: ${result.filePath}\n` +
                `📶 Network: ${args.ssid}\n` +
                `🔒 Security: ${args.security || 'WPA2'}\n` +
                `📏 Size: ${result.size} bytes`,
        },
      ],
    };
  }

  private async handleGenerateEvent(args: any) {
    const validation = EventSchema.safeParse(args);
    if (!validation.success) {
      throw new QRValidationError('Invalid event data', validation.error);
    }

    const result = await this.qrCode.generateEvent(validation.data, args.config || {});
    
    return {
      content: [
        {
          type: 'text',
          text: `📅 Event QR code generated successfully!\n\n` +
                `📁 File: ${result.filePath}\n` +
                `📅 Event: ${args.title}\n` +
                `🕐 Start: ${args.startDate}\n` +
                `📏 Size: ${result.size} bytes`,
        },
      ],
    };
  }

  private async handleDecodeQR(args: any) {
    const validation = QRAnalysisSchema.safeParse(args);
    if (!validation.success) {
      throw new QRValidationError('Invalid analysis parameters', validation.error);
    }

    const result = await this.qrCode.decodeFromImage(args.imagePath);
    
    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to decode QR code: ${result.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `🔍 QR code decoded successfully!\n\n` +
                `📄 Content: ${result.content}\n` +
                `📊 Version: ${result.metadata?.version}\n` +
                `🛡️ Error Correction: ${result.metadata?.errorCorrectionLevel}\n` +
                `🔧 Modules: ${result.metadata?.modules}`,
        },
      ],
    };
  }

  private async handleAnalyzeQuality(args: any) {
    const result = await this.qrCode.analyzeQuality(args.imagePath);
    
    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to analyze QR code: ${result.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `📊 QR Code Quality Analysis\n\n` +
                `🎯 Quality Score: ${result.quality?.score}/100\n` +
                `📖 Readability: ${result.quality?.readability}\n` +
                `💡 Recommendations:\n${result.quality?.recommendations.map(r => `  • ${r}`).join('\n')}`,
        },
      ],
    };
  }

  private async handleListTemplates(args: any) {
    const templates = this.qrCode.getTemplates();
    
    return {
      content: [
        {
          type: 'text',
          text: `🎨 Available QR Code Templates\n\n` +
                templates.map(t => 
                  `📋 ${t.name}\n` +
                  `   Description: ${t.description}\n` +
                  `   Category: ${t.category}\n` +
                  `   Size: ${t.config.size}px\n`
                ).join('\n'),
        },
      ],
    };
  }

  private async handleGenerateFromTemplate(args: any) {
    const result = await this.qrCode.generateFromTemplate(
      args.content,
      args.templateName,
      args.overrides || {}
    );
    
    return {
      content: [
        {
          type: 'text',
          text: `🎨 QR code generated from template '${args.templateName}'!\n\n` +
                `📁 File: ${result.filePath}\n` +
                `📏 Size: ${result.size} bytes\n` +
                `🔧 Format: ${result.format}`,
        },
      ],
    };
  }

  private async handleGetStatistics(args: any) {
    const stats = this.qrCode.getStatistics();
    
    return {
      content: [
        {
          type: 'text',
          text: `📊 QR Code Generation Statistics\n\n` +
                `📈 Total Generated: ${stats.totalGenerated}\n` +
                `⏱️ Average Generation Time: ${stats.averageGenerationTime.toFixed(2)}ms\n` +
                `📏 Average Size: ${stats.averageSize.toFixed(0)} bytes\n` +
                `📅 Last Generated: ${stats.lastGenerated}\n\n` +
                `📋 By Format:\n${Object.entries(stats.byFormat).map(([f, c]) => `  ${f}: ${c}`).join('\n')}\n\n` +
                `🎨 By Template:\n${Object.entries(stats.byTemplate).map(([t, c]) => `  ${t}: ${c}`).join('\n')}`,
        },
      ],
    };
  }

  private async handleValidateContent(args: any) {
    try {
      // Basic validation
      if (!args.content || args.content.trim().length === 0) {
        throw new QRValidationError('Content cannot be empty');
      }
      
      if (args.content.length > 4296) {
        throw new QRValidationError('Content exceeds maximum length of 4296 characters');
      }

      // Type-specific validation
      let recommendations: string[] = [];
      
      if (args.contentType === 'url') {
        try {
          new URL(args.content);
        } catch {
          recommendations.push('Content does not appear to be a valid URL');
        }
      }
      
      if (args.contentType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.content)) {
          recommendations.push('Content does not appear to be a valid email address');
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Content validation successful!\n\n` +
                  `📝 Content length: ${args.content.length} characters\n` +
                  `🎯 Content type: ${args.contentType || 'text'}\n` +
                  `📊 Estimated QR complexity: ${this.estimateQRComplexity(args.content)}\n` +
                  (recommendations.length > 0 ? 
                    `\n💡 Recommendations:\n${recommendations.map(r => `  • ${r}`).join('\n')}` : 
                    '\n✨ No issues found!'),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Content validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGenerateBatch(args: any) {
    const validation = BatchQRSchema.safeParse(args);
    if (!validation.success) {
      throw new QRValidationError('Invalid batch parameters', validation.error);
    }

    const results = [];
    const outputDir = args.outputDir || './qr-codes';
    
    await fs.ensureDir(outputDir);
    
    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      try {
        const result = await this.qrCode.generateStyled(
          item.content,
          item.style || {},
          { ...args.baseConfig, format: args.format }
        );
        results.push({ index: i, success: true, file: result.filePath });
      } catch (error) {
        results.push({ 
          index: i, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return {
      content: [
        {
          type: 'text',
          text: `📦 Batch QR code generation completed!\n\n` +
                `✅ Successful: ${successful}\n` +
                `❌ Failed: ${failed}\n` +
                `📁 Output directory: ${outputDir}\n\n` +
                `📋 Results:\n${results.map(r => 
                  `  ${r.index + 1}. ${r.success ? `✅ ${path.basename(r.file!)}` : `❌ ${r.error}`}`
                ).join('\n')}`,
        },
      ],
    };
  }

  private async handleOptimizeContent(args: any) {
    let optimized = args.content;
    const recommendations: string[] = [];
    
    // URL optimization
    if (optimized.startsWith('http://')) {
      optimized = optimized.replace('http://', 'https://');
      recommendations.push('Upgraded HTTP to HTTPS');
    }
    
    // Remove unnecessary spaces
    const trimmed = optimized.trim();
    if (trimmed !== optimized) {
      optimized = trimmed;
      recommendations.push('Removed leading/trailing whitespace');
    }
    
    // URL shortening suggestion for long URLs
    if (optimized.startsWith('https://') && optimized.length > 100) {
      recommendations.push('Consider using a URL shortener for long URLs');
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `🔧 Content Optimization Results\n\n` +
                `📝 Original length: ${args.content.length} characters\n` +
                `✨ Optimized length: ${optimized.length} characters\n` +
                `📉 Size reduction: ${args.content.length - optimized.length} characters\n\n` +
                `🔧 Optimized content:\n${optimized}\n\n` +
                (recommendations.length > 0 ? 
                  `💡 Optimizations applied:\n${recommendations.map(r => `  • ${r}`).join('\n')}` :
                  '✅ No optimizations needed'),
        },
      ],
    };
  }

  private estimateQRComplexity(content: string): string {
    if (content.length < 50) return 'Low';
    if (content.length < 200) return 'Medium';
    if (content.length < 500) return 'High';
    return 'Very High';
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error(chalk.green('🚀 Enhanced QR Code MCP Server started!'));
    console.error(chalk.blue('📦 Built upon @jwalsh/mcp-server-qrcode with enhanced features'));
    console.error(chalk.gray('   Use Ctrl+C to stop the server'));
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new EnhancedQRCodeMCPServer();
  server.start().catch((error) => {
    console.error(chalk.red('❌ Failed to start server:'), error);
    process.exit(1);
  });
}

export default EnhancedQRCodeMCPServer;
