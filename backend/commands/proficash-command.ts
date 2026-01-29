/**
 * ProfiCash Command
 * Parses ProfiCash export files in "feste Satzlänge 768" format
 */

import * as fs from 'fs';
import { promisify } from 'util';
import { CommandParameter, ICommand } from './command-interface.js';

const readFile = promisify(fs.readFile);

export class ProficashCommand implements ICommand {
  async execute(params: any): Promise<any> {
    const { filePath, format } = params;

    try {
      if (format !== 'feste Satzlänge 768') {
        return {
          success: false,
          error: `Unsupported format: ${format}. Only "feste Satzlänge 768" is currently supported.`,
        };
      }

      return await this.parseFixedLength768(filePath);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  /**
   * Parse ProfiCash file in "feste Satzlänge 768" format
   */
  private async parseFixedLength768(filePath: string): Promise<any> {
    if (!filePath) {
      throw new Error('filePath is required');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    // Read file content
    const content = await readFile(filePath, 'utf-8');
    const lines = content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    const rows: any[][] = [];
    let totalSum = 0;
    const yearSums: Record<string, number> = {};

    for (const line of lines) {
      // Skip lines that are too short
      if (line.length < 700) {
        console.warn(
          `Skipping line with length ${line.length}, expected at least 700`,
        );
        continue;
      }

      try {
        // Parse fixed-width fields according to ProfiCash format
        let account = line.substring(0, 10).trim();
        let dateStr = line.substring(10, 20).trim();
        let amountStr = line.substring(45, 57).trim();
        let plusOrMinus = line.substring(57, 58).trim();

        // Special case for old Sparkassen transactions
        if (plusOrMinus === 'R') {
          plusOrMinus = line.substring(58, 59).trim();
        }

        let type = line.substring(82, 109).trim();
        let toBank = line.substring(119, 127).trim();
        let toAccount = line.substring(131, 154).trim();
        let toName = line.substring(212, 266).trim();
        let reason = line.substring(266, 321).trim();
        let reason2 = line.substring(347, Math.min(line.length, 700)).trim();

        // Clean up reason fields - extract SVWZ+ content
        const svwzIndex = reason.indexOf('SVWZ+');
        if (svwzIndex !== -1) {
          reason = reason.substring(svwzIndex + 5).trim();
        }

        const svwzIndex2 = reason2.indexOf('SVWZ+');
        if (svwzIndex2 !== -1) {
          reason2 = reason2.substring(svwzIndex2 + 5).trim();
        }

        // Combine reason fields if reason2 has content
        let fullReason = reason;
        if (reason2) {
          fullReason = reason + ' ' + reason2;
        }

        // Parse amount
        amountStr = amountStr.replace(',', '.');
        let amount = parseFloat(amountStr);

        // Apply plus/minus sign
        if (plusOrMinus === '-' || plusOrMinus === 'S') {
          amount = -Math.abs(amount);
        } else {
          amount = Math.abs(amount);
        }

        // Format date from DD.MM.YYYY to display format
        const formattedDate = dateStr;

        // Extract year for summary
        const year = dateStr.split('.')[2];

        // Update sums
        totalSum += amount;
        if (!yearSums[year]) {
          yearSums[year] = 0;
        }
        yearSums[year] += amount;

        // Add row (9 columns to match the headers)
        rows.push([
          account,
          formattedDate,
          amount,
          type,
          toBank,
          toAccount,
          toName,
          fullReason,
          '', // Kategorie (category) - would need .criteria file to populate
        ]);
      } catch (error: any) {
        console.warn(`Error parsing line: ${error.message}`);
        continue;
      }
    }

    return {
      success: true,
      operation: 'parse-proficash',
      filePath: filePath,
      format: 'feste Satzlänge 768',
      headers: [
        'Konto',
        'Datum',
        'Betrag',
        'Typ',
        'BLZ',
        'Konto',
        'Empfänger',
        'VWZ',
        'Kategorie',
      ],
      rows: rows,
      summary: {
        totalRows: rows.length,
        sum: totalSum,
        yearSums: yearSums,
      },
      timestamp: new Date().toISOString(),
    };
  }

  getDescription(): string {
    return 'Parse ProfiCash export files in "feste Satzlänge 768" format';
  }

  getParameters(): CommandParameter[] {
    return [
      {
        name: 'filePath',
        type: 'string',
        description: 'Path to the ProfiCash export file',
        required: true,
      },
      {
        name: 'format',
        type: 'string',
        description:
          'Export format (currently only "feste Satzlänge 768" supported)',
        required: true,
      },
    ];
  }
}
