# Enhanced QR Code MCP Server - Usage Examples

This document provides comprehensive examples of how to use the enhanced QR code MCP server.

## Basic Usage (Compatible with @jwalsh/mcp-server-qrcode)

### Generate a simple QR code
```javascript
// Basic QR code generation - maintains compatibility with original
{
  "tool": "generate_qr_basic",
  "arguments": {
    "content": "https://example.com",
    "size": 300,
    "format": "png"
  }
}
```

## Enhanced Features

### Styled QR Codes

#### Generate a QR code with custom colors and logo
```javascript
{
  "tool": "generate_qr_styled",
  "arguments": {
    "content": "https://mycompany.com",
    "style": {
      "foregroundColor": "#1a365d",
      "backgroundColor": "#ffffff",
      "logoPath": "./assets/company-logo.png",
      "logoSize": 0.25,
      "cornerRadius": 10,
      "borderWidth": 3,
      "borderColor": "#1a365d"
    },
    "config": {
      "size": 400,
      "errorCorrectionLevel": "H",
      "format": "png"
    }
  }
}
```

#### Generate a QR code with gradient effect
```javascript
{
  "tool": "generate_qr_styled",
  "arguments": {
    "content": "Follow us @mycompany",
    "style": {
      "foregroundColor": "#e53e3e",
      "backgroundColor": "#fff5f5",
      "gradientStart": "#e53e3e",
      "gradientEnd": "#c53030",
      "dotStyle": "round",
      "cornerRadius": 20
    }
  }
}
```

### Specialized QR Code Types

#### vCard (Contact Information)
```javascript
{
  "tool": "generate_vcard_qr",
  "arguments": {
    "firstName": "John",
    "lastName": "Smith",
    "organization": "Tech Corp",
    "title": "Software Engineer",
    "phone": "+1-555-123-4567",
    "email": "john.smith@techcorp.com",
    "website": "https://johnsmith.dev",
    "address": {
      "street": "123 Tech Street",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94105",
      "country": "USA"
    },
    "config": {
      "size": 350,
      "format": "png"
    }
  }
}
```

#### WiFi Network Credentials
```javascript
{
  "tool": "generate_wifi_qr",
  "arguments": {
    "ssid": "OfficeNetwork",
    "password": "SecurePassword123",
    "security": "WPA2",
    "hidden": false,
    "config": {
      "size": 300,
      "format": "svg"
    }
  }
}
```

#### Calendar Event
```javascript
{
  "tool": "generate_event_qr",
  "arguments": {
    "title": "Team Meeting",
    "description": "Weekly team sync and planning session",
    "location": "Conference Room A",
    "startDate": "2025-06-20T10:00:00Z",
    "endDate": "2025-06-20T11:00:00Z",
    "allDay": false,
    "config": {
      "size": 300,
      "errorCorrectionLevel": "M"
    }
  }
}
```

### Template-Based Generation

#### List available templates
```javascript
{
  "tool": "list_qr_templates",
  "arguments": {}
}
```

#### Generate using a template
```javascript
{
  "tool": "generate_qr_from_template",
  "arguments": {
    "content": "https://mybusiness.com",
    "templateName": "business",
    "overrides": {
      "size": 500,
      "foregroundColor": "#2d3748"
    }
  }
}
```

### Batch Generation

#### Generate multiple QR codes at once
```javascript
{
  "tool": "generate_qr_batch",
  "arguments": {
    "items": [
      {
        "content": "https://product1.com",
        "filename": "product1-qr.png",
        "style": {
          "foregroundColor": "#e53e3e",
          "backgroundColor": "#ffffff"
        }
      },
      {
        "content": "https://product2.com",
        "filename": "product2-qr.png",
        "style": {
          "foregroundColor": "#3182ce",
          "backgroundColor": "#ffffff"
        }
      },
      {
        "content": "https://product3.com",
        "filename": "product3-qr.png"
      }
    ],
    "outputDir": "./marketing-qr-codes",
    "format": "png",
    "baseConfig": {
      "size": 300,
      "errorCorrectionLevel": "M"
    }
  }
}
```

## Analysis and Quality Tools

### Decode existing QR code
```javascript
{
  "tool": "decode_qr_image",
  "arguments": {
    "imagePath": "./existing-qr-code.png",
    "outputFormat": "json"
  }
}
```

### Analyze QR code quality
```javascript
{
  "tool": "analyze_qr_quality",
  "arguments": {
    "imagePath": "./qr-code-to-analyze.png"
  }
}
```

### Validate content before generation
```javascript
{
  "tool": "validate_qr_content",
  "arguments": {
    "content": "https://example.com/very/long/url/that/might/be/problematic",
    "contentType": "url"
  }
}
```

### Optimize content for QR codes
```javascript
{
  "tool": "optimize_qr_content",
  "arguments": {
    "content": "   http://example.com/page   ",
    "targetSize": 300
  }
}
```

## Statistics and Monitoring

### Get generation statistics
```javascript
{
  "tool": "get_qr_statistics",
  "arguments": {}
}
```

## Advanced Use Cases

### Marketing Campaign QR Codes
```javascript
// Generate branded QR codes for a marketing campaign
{
  "tool": "generate_qr_styled",
  "arguments": {
    "content": "https://campaign.mycompany.com/summer2025?utm_source=qr&utm_campaign=summer",
    "style": {
      "foregroundColor": "#ff6b35",
      "backgroundColor": "#ffffff",
      "logoPath": "./brand/campaign-logo.png",
      "logoSize": 0.2,
      "cornerRadius": 15,
      "dotStyle": "round",
      "borderWidth": 4,
      "borderColor": "#ff6b35"
    },
    "config": {
      "size": 400,
      "errorCorrectionLevel": "H",
      "format": "png"
    }
  }
}
```

### Restaurant Menu QR Code
```javascript
{
  "tool": "generate_qr_from_template",
  "arguments": {
    "content": "https://restaurant.com/menu",
    "templateName": "business",
    "overrides": {
      "foregroundColor": "#2f855a",
      "backgroundColor": "#f0fff4",
      "size": 350,
      "cornerRadius": 8
    }
  }
}
```

### Event Check-in System
```javascript
{
  "tool": "generate_event_qr",
  "arguments": {
    "title": "Tech Conference 2025",
    "description": "Annual technology conference and networking event",
    "location": "Convention Center, San Francisco",
    "startDate": "2025-09-15T09:00:00Z",
    "endDate": "2025-09-15T18:00:00Z",
    "allDay": false,
    "config": {
      "size": 400,
      "errorCorrectionLevel": "H",
      "format": "svg"
    }
  }
}
```

### Guest WiFi QR Code (No Password)
```javascript
{
  "tool": "generate_wifi_qr",
  "arguments": {
    "ssid": "GuestNetwork",
    "security": "nopass",
    "hidden": false,
    "config": {
      "size": 250,
      "format": "png"
    }
  }
}
```

## Error Handling Examples

### Handling validation errors
```javascript
// This will fail validation and show helpful error messages
{
  "tool": "generate_qr_basic",
  "arguments": {
    "content": "", // Empty content will trigger validation error
    "size": 50000  // Size too large will trigger validation error
  }
}
```

### Quality analysis of poor QR code
```javascript
{
  "tool": "analyze_qr_quality",
  "arguments": {
    "imagePath": "./low-quality-qr.jpg"
  }
}
// Returns quality score and specific recommendations for improvement
```

## Integration Examples

### MCP Client Configuration
Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "qrcode-enhanced": {
      "command": "node",
      "args": ["path/to/mcp-server-qrcode-enhanced/dist/index.js"],
      "env": {
        "QR_OUTPUT_DIR": "./generated-qr-codes",
        "QR_DEFAULT_SIZE": "300",
        "QR_DEFAULT_ERROR_CORRECTION": "M"
      }
    }
  }
}
```

### Programmatic Usage in Applications
```typescript
import EnhancedQRCodeMCPServer from 'mcp-server-qrcode-enhanced';

const qrServer = new EnhancedQRCodeMCPServer();
await qrServer.start();
```

## Best Practices

1. **Error Correction Levels**: Use 'H' (high) for QR codes with logos or complex styling
2. **Size Guidelines**: Minimum 200px for reliable scanning, 300-400px recommended for print
3. **Content Optimization**: Keep URLs short, validate content before generation
4. **Styling Balance**: Ensure sufficient contrast between foreground and background
5. **Logo Integration**: Keep logos under 25% of QR code area, use white background
6. **Format Selection**: Use PNG for print, SVG for scalable web graphics
7. **Batch Processing**: Use batch generation for consistent styling across multiple codes

## Migration from Original @jwalsh/mcp-server-qrcode

The enhanced server maintains full compatibility with the original. Simply replace your tool calls:

```javascript
// Original server
{ "tool": "generate-qrcode", "arguments": { ... } }

// Enhanced server (backward compatible)
{ "tool": "generate_qr_basic", "arguments": { ... } }

// Or use enhanced features
{ "tool": "generate_qr_styled", "arguments": { ... } }
```

All original functionality works exactly the same, with many new features available when needed.
