# Enhanced QR Code MCP Server

An enhanced Model Context Protocol (MCP) server for advanced QR code generation and processing, inspired by and extending [@jwalsh/mcp-server-qrcode](https://github.com/jwalsh/mcp-server-qrcode).

## 🙏 Attribution

This project builds upon the excellent foundation provided by [@jwalsh/mcp-server-qrcode](https://github.com/jwalsh/mcp-server-qrcode). We extend our gratitude to the original author for creating the base QR code MCP server that inspired these enhancements.

## ✨ Enhanced Features

Beyond the original QR code generation capabilities, this enhanced version adds:

### 🚀 Advanced QR Code Generation
- **Custom styling**: Logo embedding, custom colors, rounded corners
- **Multiple formats**: PNG, SVG, PDF output support
- **Batch processing**: Generate multiple QR codes simultaneously
- **Template system**: Pre-defined QR code templates for common use cases

### 📊 Smart Content Detection
- **URL validation**: Automatically validates and optimizes URLs
- **Contact cards**: Generate vCard QR codes from contact information
- **WiFi credentials**: Create WiFi network QR codes
- **Event details**: Generate calendar event QR codes

### 🔍 QR Code Analysis
- **Decode existing QR codes**: Extract content from QR code images
- **Quality assessment**: Analyze QR code readability and optimization
- **Format detection**: Identify QR code content types

### 📈 Analytics & Tracking
- **Usage statistics**: Track QR code generation patterns
- **Performance metrics**: Monitor server performance and response times
- **Export capabilities**: Generate reports and analytics

## 🛠 Installation

```bash
# Clone the repository
git clone https://github.com/myownipgit/mcp-server-qrcode-enhanced.git
cd mcp-server-qrcode-enhanced

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## 🔧 Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "qrcode-enhanced": {
      "command": "node",
      "args": ["path/to/mcp-server-qrcode-enhanced/dist/index.js"],
      "env": {
        "QR_OUTPUT_DIR": "./qr-codes",
        "QR_DEFAULT_SIZE": "300",
        "QR_DEFAULT_ERROR_CORRECTION": "M"
      }
    }
  }
}
```

## 📋 Available Tools

### Basic QR Code Generation
- `generate_qr_basic` - Simple QR code generation
- `generate_qr_styled` - QR code with custom styling
- `generate_qr_batch` - Generate multiple QR codes

### Specialized QR Codes
- `generate_vcard_qr` - Contact card QR codes
- `generate_wifi_qr` - WiFi network QR codes
- `generate_event_qr` - Calendar event QR codes

### Analysis & Processing
- `decode_qr_image` - Extract content from QR code images
- `analyze_qr_quality` - Assess QR code quality
- `optimize_qr_content` - Optimize content for QR codes

### Templates & Utilities
- `list_qr_templates` - Available QR code templates
- `get_qr_statistics` - Usage and performance statistics
- `validate_qr_content` - Validate content before generation

## 📖 Usage Examples

### Generate a styled QR code
```typescript
const result = await generateStyledQR({
  content: "https://example.com",
  style: {
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    logoPath: "./logo.png",
    cornerRadius: 10
  },
  format: "png",
  size: 400
});
```

### Create a WiFi QR code
```typescript
const wifiQR = await generateWiFiQR({
  ssid: "MyNetwork",
  password: "MyPassword",
  security: "WPA2",
  hidden: false
});
```

### Decode an existing QR code
```typescript
const decoded = await decodeQRImage({
  imagePath: "./qr-code.png",
  outputFormat: "json"
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Make sure to:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Reference the original [@jwalsh/mcp-server-qrcode](https://github.com/jwalsh/mcp-server-qrcode) when appropriate

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Original QR Code MCP Server](https://github.com/jwalsh/mcp-server-qrcode) by @jwalsh
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

## 📝 Changelog

### v1.0.0
- Initial enhanced version based on @jwalsh/mcp-server-qrcode
- Added custom styling capabilities
- Implemented specialized QR code types
- Added QR code analysis tools
- Enhanced error handling and validation

---

Built with ❤️ on top of the excellent foundation by [@jwalsh](https://github.com/jwalsh)
