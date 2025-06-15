import QRCode from 'qrcode';
import QRCodeSVG from 'qrcode-svg';
import jsQR from 'jsqr';
import Jimp from 'jimp';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  QRConfig,
  QRStyle,
  QRGenerationResult,
  QRAnalysisResult,
  VCard,
  WiFi,
  Event,
  QRGenerationError,
  QRAnalysisError,
  QRValidationError,
  QRTemplate,
} from './types.js';

export class QRCodeEnhanced {
  private statistics = {
    totalGenerated: 0,
    byFormat: {} as Record<string, number>,
    byTemplate: {} as Record<string, number>,
    averageSize: 0,
    averageGenerationTime: 0,
    generationTimes: [] as number[],
    sizes: [] as number[],
    topContentTypes: [] as Array<{ type: string; count: number }>,
    lastGenerated: new Date().toISOString(),
  };

  private templates: Map<string, QRTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Generate a basic QR code
   * Maintains compatibility with the original @jwalsh/mcp-server-qrcode
   */
  async generateBasic(
    content: string,
    config: Partial<QRConfig> = {}
  ): Promise<QRGenerationResult> {
    const startTime = Date.now();
    
    try {
      this.validateContent(content);
      
      const finalConfig = { ...config } as QRConfig;
      const outputPath = this.generateOutputPath(finalConfig.format || 'png');
      
      await fs.ensureDir(path.dirname(outputPath));
      
      let result: QRGenerationResult;
      
      switch (finalConfig.format) {
        case 'svg':
          result = await this.generateSVG(content, finalConfig, outputPath);
          break;
        case 'png':
        default:
          result = await this.generatePNG(content, finalConfig, outputPath);
          break;
      }
      
      this.updateStatistics(result, Date.now() - startTime);
      return result;
      
    } catch (error) {
      throw new QRGenerationError(
        `Failed to generate basic QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { content, config }
      );
    }
  }

  /**
   * Generate a styled QR code with custom appearance
   */
  async generateStyled(
    content: string,
    style: Partial<QRStyle> = {},
    config: Partial<QRConfig> = {}
  ): Promise<QRGenerationResult> {
    const startTime = Date.now();
    
    try {
      this.validateContent(content);
      
      const finalStyle = { ...style } as QRStyle;
      const finalConfig = { ...config } as QRConfig;
      const outputPath = this.generateOutputPath(finalConfig.format || 'png');
      
      await fs.ensureDir(path.dirname(outputPath));
      
      // Generate base QR code
      const baseQR = await QRCode.toDataURL(content, {
        width: finalConfig.size,
        margin: finalConfig.margin,
        errorCorrectionLevel: finalConfig.errorCorrectionLevel,
        color: {
          dark: finalStyle.foregroundColor,
          light: finalStyle.backgroundColor,
        },
      });
      
      // Apply styling enhancements
      const styledResult = await this.applyAdvancedStyling(
        baseQR,
        finalStyle,
        finalConfig,
        outputPath
      );
      
      this.updateStatistics(styledResult, Date.now() - startTime);
      return styledResult;
      
    } catch (error) {
      throw new QRGenerationError(
        `Failed to generate styled QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { content, style, config }
      );
    }
  }

  /**
   * Generate QR code for vCard contact information
   */
  async generateVCard(vcard: VCard, config: Partial<QRConfig> = {}): Promise<QRGenerationResult> {
    const vcardContent = this.buildVCardContent(vcard);
    return this.generateBasic(vcardContent, config);
  }

  /**
   * Generate QR code for WiFi network credentials
   */
  async generateWiFi(wifi: WiFi, config: Partial<QRConfig> = {}): Promise<QRGenerationResult> {
    const wifiContent = this.buildWiFiContent(wifi);
    return this.generateBasic(wifiContent, config);
  }

  /**
   * Generate QR code for calendar event
   */
  async generateEvent(event: Event, config: Partial<QRConfig> = {}): Promise<QRGenerationResult> {
    const eventContent = this.buildEventContent(event);
    return this.generateBasic(eventContent, config);
  }

  /**
   * Decode QR code from image file
   */
  async decodeFromImage(imagePath: string): Promise<QRAnalysisResult> {
    try {
      if (!await fs.pathExists(imagePath)) {
        throw new QRAnalysisError(`Image file not found: ${imagePath}`);
      }

      // Load image and convert to ImageData format
      const image = await Jimp.read(imagePath);
      const { width, height } = image.bitmap;
      const imageData = {
        data: new Uint8ClampedArray(image.bitmap.data),
        width,
        height,
      };

      // Decode QR code
      const code = jsQR(imageData.data, width, height);
      
      if (!code) {
        return {
          success: false,
          error: 'No QR code found in image',
        };
      }

      return {
        success: true,
        content: code.data,
        format: 'text',
        metadata: {
          version: code.version,
          errorCorrectionLevel: code.errorCorrectionLevel,
          maskPattern: code.maskPattern,
          modules: code.modules,
        },
      };

    } catch (error) {
      throw new QRAnalysisError(
        `Failed to decode QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { imagePath }
      );
    }
  }

  /**
   * Analyze QR code quality and provide recommendations
   */
  async analyzeQuality(imagePath: string): Promise<QRAnalysisResult> {
    try {
      const decodeResult = await this.decodeFromImage(imagePath);
      
      if (!decodeResult.success) {
        return {
          ...decodeResult,
          quality: {
            score: 0,
            readability: 'poor',
            recommendations: ['QR code could not be decoded', 'Check image quality and contrast'],
          },
        };
      }

      // Analyze image properties for quality assessment
      const image = await sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await image.stats();
      
      const quality = this.assessQuality(metadata, stats, decodeResult.content!);
      
      return {
        ...decodeResult,
        quality,
      };

    } catch (error) {
      throw new QRAnalysisError(
        `Failed to analyze QR code quality: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { imagePath }
      );
    }
  }

  /**
   * Get predefined templates
   */
  getTemplates(): QRTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add a custom template
   */
  addTemplate(template: QRTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Generate QR code using a template
   */
  async generateFromTemplate(
    content: string,
    templateName: string,
    overrides: Partial<QRStyle & QRConfig> = {}
  ): Promise<QRGenerationResult> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new QRValidationError(`Template not found: ${templateName}`);
    }

    const mergedStyle = { ...template.style, ...overrides };
    const mergedConfig = { ...template.config, ...overrides };

    const result = await this.generateStyled(content, mergedStyle, mergedConfig);
    
    // Update template usage statistics
    this.statistics.byTemplate[templateName] = (this.statistics.byTemplate[templateName] || 0) + 1;
    
    return result;
  }

  /**
   * Get generation statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      averageSize: this.statistics.sizes.length > 0 
        ? this.statistics.sizes.reduce((a, b) => a + b, 0) / this.statistics.sizes.length 
        : 0,
      averageGenerationTime: this.statistics.generationTimes.length > 0
        ? this.statistics.generationTimes.reduce((a, b) => a + b, 0) / this.statistics.generationTimes.length
        : 0,
    };
  }

  // Private helper methods

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new QRValidationError('Content cannot be empty');
    }
    
    if (content.length > 4296) {
      throw new QRValidationError('Content exceeds maximum length of 4296 characters');
    }
  }

  private generateOutputPath(format: string): string {
    const outputDir = process.env.QR_OUTPUT_DIR || './qr-codes';
    const filename = `qr-${uuidv4()}.${format}`;
    return path.join(outputDir, filename);
  }

  private async generatePNG(
    content: string,
    config: QRConfig,
    outputPath: string
  ): Promise<QRGenerationResult> {
    const buffer = await QRCode.toBuffer(content, {
      width: config.size,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
    });

    await fs.writeFile(outputPath, buffer);

    return {
      success: true,
      filePath: outputPath,
      data: buffer,
      format: 'png',
      size: buffer.length,
      contentType: 'image/png',
      metadata: {
        generatedAt: new Date().toISOString(),
        originalContent: content,
        estimatedSize: buffer.length,
      },
    };
  }

  private async generateSVG(
    content: string,
    config: QRConfig,
    outputPath: string
  ): Promise<QRGenerationResult> {
    const qrSvg = new QRCodeSVG({
      content,
      width: config.size,
      height: config.size,
      padding: config.margin * 10,
      color: '#000000',
      background: '#ffffff',
      ecl: config.errorCorrectionLevel,
    });

    const svgString = qrSvg.svg();
    await fs.writeFile(outputPath, svgString);

    return {
      success: true,
      filePath: outputPath,
      data: svgString,
      format: 'svg',
      size: svgString.length,
      contentType: 'image/svg+xml',
      metadata: {
        generatedAt: new Date().toISOString(),
        originalContent: content,
        estimatedSize: svgString.length,
      },
    };
  }

  private async applyAdvancedStyling(
    baseQR: string,
    style: QRStyle,
    config: QRConfig,
    outputPath: string
  ): Promise<QRGenerationResult> {
    // For now, return the base QR with basic styling
    // In a full implementation, this would apply gradients, logos, custom shapes, etc.
    const canvas = createCanvas(config.size || 300, config.size || 300);
    const ctx = canvas.getContext('2d');
    
    // Load base QR image
    const img = await loadImage(baseQR);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply logo if specified
    if (style.logoPath && await fs.pathExists(style.logoPath)) {
      try {
        const logo = await loadImage(style.logoPath);
        const logoSize = canvas.width * (style.logoSize || 0.2);
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        
        // Draw logo background
        ctx.fillStyle = style.backgroundColor || '#ffffff';
        ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
        
        // Draw logo
        ctx.drawImage(logo, x, y, logoSize, logoSize);
      } catch (error) {
        console.warn('Failed to apply logo:', error);
      }
    }
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
    
    return {
      success: true,
      filePath: outputPath,
      data: buffer,
      format: 'png',
      size: buffer.length,
      contentType: 'image/png',
      metadata: {
        generatedAt: new Date().toISOString(),
        originalContent: 'styled content',
        estimatedSize: buffer.length,
      },
    };
  }

  private buildVCardContent(vcard: VCard): string {
    let content = 'BEGIN:VCARD\nVERSION:3.0\n';
    content += `FN:${vcard.firstName} ${vcard.lastName}\n`;
    content += `N:${vcard.lastName};${vcard.firstName};;;\n`;
    
    if (vcard.organization) {
      content += `ORG:${vcard.organization}\n`;
    }
    if (vcard.title) {
      content += `TITLE:${vcard.title}\n`;
    }
    if (vcard.phone) {
      content += `TEL:${vcard.phone}\n`;
    }
    if (vcard.email) {
      content += `EMAIL:${vcard.email}\n`;
    }
    if (vcard.website) {
      content += `URL:${vcard.website}\n`;
    }
    if (vcard.address) {
      const addr = vcard.address;
      content += `ADR:;;${addr.street || ''};${addr.city || ''};${addr.state || ''};${addr.zip || ''};${addr.country || ''}\n`;
    }
    
    content += 'END:VCARD';
    return content;
  }

  private buildWiFiContent(wifi: WiFi): string {
    return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password || ''};H:${wifi.hidden ? 'true' : 'false'};;`;
  }

  private buildEventContent(event: Event): string {
    let content = 'BEGIN:VEVENT\n';
    content += `SUMMARY:${event.title}\n`;
    content += `DTSTART:${this.formatDateForEvent(event.startDate, event.allDay)}\n`;
    
    if (event.endDate) {
      content += `DTEND:${this.formatDateForEvent(event.endDate, event.allDay)}\n`;
    }
    if (event.description) {
      content += `DESCRIPTION:${event.description}\n`;
    }
    if (event.location) {
      content += `LOCATION:${event.location}\n`;
    }
    
    content += 'END:VEVENT';
    return content;
  }

  private formatDateForEvent(dateStr: string, allDay: boolean): string {
    const date = new Date(dateStr);
    if (allDay) {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private assessQuality(metadata: any, stats: any, content: string): any {
    let score = 100;
    const recommendations: string[] = [];
    
    // Check image size
    if (metadata.width < 200 || metadata.height < 200) {
      score -= 20;
      recommendations.push('Increase image resolution for better readability');
    }
    
    // Check contrast (simplified)
    const contrast = stats.channels?.[0]?.max - stats.channels?.[0]?.min;
    if (contrast < 128) {
      score -= 30;
      recommendations.push('Improve contrast between foreground and background');
    }
    
    // Check content length
    if (content.length > 1000) {
      score -= 10;
      recommendations.push('Consider reducing content length for better reliability');
    }
    
    let readability: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) readability = 'excellent';
    else if (score >= 70) readability = 'good';
    else if (score >= 50) readability = 'fair';
    else readability = 'poor';
    
    return { score: Math.max(0, score), readability, recommendations };
  }

  private updateStatistics(result: QRGenerationResult, generationTime: number): void {
    this.statistics.totalGenerated++;
    this.statistics.byFormat[result.format] = (this.statistics.byFormat[result.format] || 0) + 1;
    this.statistics.generationTimes.push(generationTime);
    this.statistics.sizes.push(result.size);
    this.statistics.lastGenerated = new Date().toISOString();
    
    // Keep only last 1000 measurements
    if (this.statistics.generationTimes.length > 1000) {
      this.statistics.generationTimes = this.statistics.generationTimes.slice(-1000);
    }
    if (this.statistics.sizes.length > 1000) {
      this.statistics.sizes = this.statistics.sizes.slice(-1000);
    }
  }

  private initializeDefaultTemplates(): void {
    // Business template
    this.templates.set('business', {
      name: 'business',
      description: 'Professional business card style',
      category: 'business',
      style: {
        foregroundColor: '#1a365d',
        backgroundColor: '#ffffff',
        cornerRadius: 5,
        dotStyle: 'square',
        borderWidth: 2,
        borderColor: '#1a365d',
      },
      config: {
        size: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
        format: 'png',
      },
    });

    // Social template
    this.templates.set('social', {
      name: 'social',
      description: 'Colorful social media style',
      category: 'social',
      style: {
        foregroundColor: '#e53e3e',
        backgroundColor: '#fff5f5',
        cornerRadius: 15,
        dotStyle: 'round',
        gradientStart: '#e53e3e',
        gradientEnd: '#c53030',
      },
      config: {
        size: 400,
        margin: 1,
        errorCorrectionLevel: 'M',
        format: 'png',
      },
    });
  }
}
