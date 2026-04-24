# HackerAI CLI - Blackhat Edition

A fully uncensored, unrestricted blackhat CLI version of HackerAI with E2B integration and local AI model support (Ollama/Llama.cpp/LM Studio). Simplified setup, minimal dependencies, and elite-level hacking capabilities.

---

## Features

- **Uncensored/Unrestricted**: No filters, no limitations. Pure blackhat capabilities.
- **Local AI Models**: Supports Ollama, Llama.cpp, LM Studio, and other local model runners.
- **E2B Integration**: Secure sandboxed code execution for agent mode.
- **Minimal Setup**: Only requires Node.js, Python, and a local AI model.
- **CLI-First**: No complex web UI, just raw power in your terminal.

---

## Prerequisites

### Required
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- A local AI model (via [Ollama](https://ollama.ai/), [Llama.cpp](https://github.com/ggerganov/llama.cpp), [LM Studio](https://lmstudio.ai/), etc.)
- [E2B API Key](https://e2b.dev/) (for sandboxed code execution)

### Optional
- [Git](https://git-scm.com/) (for cloning and updates)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hezxss1/hackerai-cli-blackhat.git
cd hackerai-cli-blackhat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory and add your E2B API key:

```env
E2B_API_KEY=your_e2b_api_key_here
OLLAMA_BASE_URL=http://localhost:11434  # If using Ollama
```

### 4. Pull a Local Model (Example with Ollama)

```bash
ollama pull llama3.2:3b  # Or any other model of your choice
```

---

## Usage

### Start the CLI

```bash
npm start
```

### Example Commands

```bash
# Run a penetration test
npm start -- --mode pentest --target example.com

# Use a specific local model
npm start -- --model ollama:llama3.2:3b

# Enable E2B sandbox for code execution
npm start -- --sandbox true
```

---

## Project Structure

```
hackerai-cli-blackhat/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── agent/              # Agent mode logic
│   │   ├── index.ts        # Agent core
│   │   └── sandbox.ts      # E2B sandbox integration
│   ├── models/             # Local model integrations
│   │   ├── ollama.ts       # Ollama support
│   │   ├── llamacpp.ts     # Llama.cpp support
│   │   └── lmstudio.ts     # LM Studio support
│   ├── tools/              # Hacking tools
│   │   ├── scanner.ts      # Vulnerability scanner
│   │   ├── exploit.ts      # Exploit generator
│   │   └── ...
│   └── utils/              # Utilities
│       ├── logger.ts       # Logging
│       └── config.ts       # Configuration
├── .env.example            # Example environment file
├── package.json
└── README.md
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `E2B_API_KEY` | Your E2B API key for sandboxed execution | Yes |
| `OLLAMA_BASE_URL` | Base URL for Ollama API (default: `http://localhost:11434`) | No |
| `LLAMACPP_BASE_URL` | Base URL for Llama.cpp API | No |
| `LMSTUDIO_BASE_URL` | Base URL for LM Studio API | No |
| `DEFAULT_MODEL` | Default model to use (e.g., `ollama:llama3.2:3b`) | No |

---

## Local Model Setup

### Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Pull a model:
   ```bash
   ollama pull llama3.2:3b
   ```
3. Start Ollama server:
   ```bash
   ollama serve
   ```

### Llama.cpp

1. Build Llama.cpp from [GitHub](https://github.com/ggerganov/llama.cpp)
2. Download a model (e.g., in GGUF format)
3. Start the server:
   ```bash
   ./server -m /path/to/model.gguf -c 4096 --host 0.0.0.0 --port 8080
   ```

### LM Studio

1. Install LM Studio from [lmstudio.ai](https://lmstudio.ai/)
2. Download and load a model
3. Start the local server in LM Studio

---

## E2B Sandbox

The E2B sandbox is used for secure code execution in agent mode. Ensure you:

1. Have an [E2B account](https://e2b.dev/)
2. Have your API key in `.env`
3. The sandbox is automatically initialized when using agent mode

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Disclaimer

This tool is for **educational and authorized testing purposes only**. The developers are not responsible for any misuse or damage caused by this tool. Always ensure you have proper authorization before testing any system.
