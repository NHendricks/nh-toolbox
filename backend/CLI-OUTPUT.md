# CLI Output Formats

Die CLI unterstützt zwei Output-Formate:

## 1. Standard Output (Default)

Nur das **`result`-Feld** wird ausgegeben:

```bash
node dist/cli.js ping
```

**Ausgabe:**

```
Pong
```

```bash
node dist/cli.js calculate "{\"operation\":\"add\",\"a\":5,\"b\":3}"
```

**Ausgabe:**

```
8
```

**Fehler-Ausgabe:**

```
Error: Unknown command: unknownCommand
```

## 2. JSON Format (mit --json Flag)

Vollständiges JSON-Response mit Metadaten und allen Feldern:

```bash
node dist/cli.js ping --json
```

**Erfolgreiche Ausgabe:**

```json
{
  "success": true,
  "data": {
    "result": "Pong",
    "message": "Pong",
    "params": "",
    "timestamp": "2026-01-24T15:19:58.568Z"
  },
  "toolname": "ping",
  "timestamp": "2026-01-24T15:19:58.569Z"
}
```

**Fehler-Ausgabe:**

```json
{
  "success": false,
  "error": "Unknown command: unknownCommand",
  "toolname": "unknownCommand",
  "timestamp": "2026-01-24T15:12:07.718Z"
}
```

## Beispiele

### Ping Command

**Standard Output:**

```bash
node dist/cli.js ping
```

```
Pong
```

**JSON Output:**

```bash
node dist/cli.js ping --json
```

```json
{
  "success": true,
  "data": {
    "result": "Pong",
    "message": "Pong",
    "params": "",
    "timestamp": "2026-01-24T15:19:58.568Z"
  },
  "toolname": "ping",
  "timestamp": "2026-01-24T15:19:58.569Z"
}
```

### Calculate Command

**Standard Output:**

```bash
node dist/cli.js calculate "{\"operation\":\"add\",\"a\":5,\"b\":3}"
```

```
8
```

**JSON Output:**

```bash
node dist/cli.js calculate "{\"operation\":\"add\",\"a\":5,\"b\":3}" --json
```

```json
{
  "success": true,
  "data": {
    "result": 8,
    "operation": "add",
    "a": 5,
    "b": 3
  },
  "toolname": "calculate",
  "timestamp": "2026-01-24T15:20:19.169Z"
}
```

### Help Command

**Standard Output:**

```bash
node dist/cli.js help
```

```json
{
  "ping": "Simple ping command - returns Pong with timestamp",
  "calculate": "Calculate command - performs basic arithmetic operations (add, subtract, multiply, divide)",
  "help": "Help command - lists all available commands"
}
```

**JSON Output:**

```bash
node dist/cli.js help --json
```

```json
{
  "success": true,
  "data": {
    "result": {
      "ping": "Simple ping command - returns Pong with timestamp",
      "calculate": "Calculate command - performs basic arithmetic operations (add, subtract, multiply, divide)",
      "help": "Help command - lists all available commands"
    },
    "availableCommands": { ... },
    "commandParameters": { ... },
    "usage": "node cli.js <toolname> [params]",
    "example1": "node cli.js ping",
    "example2": "node cli.js echo \"Hello World\"",
    "example3": "node cli.js calculate '{\"operation\":\"add\",\"a\":5,\"b\":3}'"
  },
  "toolname": "help",
  "timestamp": "2026-01-24T15:20:38.326Z"
}
```

## Command Response Structure

Alle Commands müssen ein **`result`-Feld** zurückgeben:

```typescript
{
  result: any,           // Das Hauptergebnis (wird im Standard-Modus ausgegeben)
  ...                    // Weitere Felder mit Details (nur im JSON-Modus sichtbar)
}
```

## Verwendung

- **Standard**: Gibt nur das `result`-Feld aus (für Menschen lesbar, einfache Ausgabe)
- **--json**: Gibt vollständiges Response-Objekt mit allen Metadaten aus (für maschinelle Verarbeitung)

## Integration

### Command Line Interface (CLI)

Wenn Sie die CLI direkt von der Kommandozeile aufrufen:

- **Ohne `--json`**: Gibt nur das `result`-Feld aus (für Menschen lesbar)
- **Mit `--json`**: Gibt vollständiges Response-Objekt mit success, data, toolname, timestamp aus

### Electron App

Die Electron App verwendet intern **immer** das `--json` Flag, um vollständige Responses mit Metadaten zu erhalten. Dies geschieht automatisch in `process/register-commands.ts`.

### IPC Bridge

Die IPC Bridge (für direkten Zugriff aus der Electron App) gibt ebenfalls immer das vollständige Response-Format zurück.

## Neue Commands entwickeln

Beim Erstellen neuer Commands muss das **`result`-Feld** immer gesetzt werden:

```typescript
async execute(params: any): Promise<any> {
  // Berechnung durchführen
  const calculatedResult = ...;

  // Response mit result-Feld zurückgeben
  return {
    result: calculatedResult,  // ERFORDERLICH: Wird im Standard-Modus ausgegeben
    // Weitere Details hinzufügen
    details: "...",
    timestamp: new Date().toISOString(),
    // ...
  };
}
```
