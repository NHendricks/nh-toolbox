/**
 * Tests for ZipHelper
 */

import * as fs from 'fs';
import * as path from 'path';
import { ZipHelper } from '../commands/zip-helper.js';

describe('ZipHelper', () => {
  describe('parsePath', () => {
    it('should parse simple zip path', () => {
      const result = ZipHelper.parsePath('D:\\archive.zip/folder/file.txt');

      expect(result.isZipPath).toBe(true);
      expect(result.zipFile).toBe(`D:${path.sep}archive.zip`);
      expect(result.internalPath).toBe('folder/file.txt');
    });

    it('should parse zip path with forward slashes', () => {
      const result = ZipHelper.parsePath('D:/archive.zip/folder/file.txt');

      expect(result.isZipPath).toBe(true);
      expect(result.zipFile).toBe(`D:${path.sep}archive.zip`);
      expect(result.internalPath).toBe('folder/file.txt');
    });

    it('should not parse path without internal path as zip path', () => {
      const result = ZipHelper.parsePath('D:\\archive.zip');

      expect(result.isZipPath).toBe(false);
      expect(result.zipFile).toBe('');
      expect(result.internalPath).toBe('');
    });

    it('should not parse non-zip path', () => {
      const result = ZipHelper.parsePath('D:\\folder\\file.txt');

      expect(result.isZipPath).toBe(false);
    });

    it('should handle zip path at root', () => {
      const result = ZipHelper.parsePath('C:\\test.zip/file.txt');

      expect(result.isZipPath).toBe(true);
      expect(result.zipFile).toBe(`C:${path.sep}test.zip`);
      expect(result.internalPath).toBe('file.txt');
    });

    it('should handle nested zip directories', () => {
      const result = ZipHelper.parsePath(
        'D:\\archives\\data.zip/folder/subfolder/file.txt',
      );

      expect(result.isZipPath).toBe(true);
      expect(result.zipFile).toBe(`D:${path.sep}archives${path.sep}data.zip`);
      expect(result.internalPath).toBe('folder/subfolder/file.txt');
    });
  });

  describe('isZipFile', () => {
    it('should return true for existing zip files', () => {
      const testZipPath = path.join(process.cwd(), 'test.zip');

      // Create a temporary zip file for testing
      if (!fs.existsSync(testZipPath)) {
        fs.writeFileSync(testZipPath, '');
      }

      const result = ZipHelper.isZipFile(testZipPath);

      expect(result).toBe(true);

      // Cleanup
      if (fs.existsSync(testZipPath)) {
        fs.unlinkSync(testZipPath);
      }
    });

    it('should return false for non-existing files', () => {
      const result = ZipHelper.isZipFile('nonexistent.zip');

      expect(result).toBe(false);
    });

    it('should return false for non-zip files', () => {
      const testFilePath = path.join(process.cwd(), 'test.txt');

      fs.writeFileSync(testFilePath, 'test');
      const result = ZipHelper.isZipFile(testFilePath);

      expect(result).toBe(false);

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it('should handle case-insensitive zip extension', () => {
      const testZipPath = path.join(process.cwd(), 'test.ZIP');

      fs.writeFileSync(testZipPath, '');
      const result = ZipHelper.isZipFile(testZipPath);

      expect(result).toBe(true);

      // Cleanup
      fs.unlinkSync(testZipPath);
    });
  });

  describe('listZipContents', () => {
    it('should throw error for non-existing zip file', () => {
      expect(() => {
        ZipHelper.listZipContents('nonexistent.zip');
      }).toThrow('ZIP file does not exist');
    });
  });

  describe('readFromZip', () => {
    it('should throw error for non-existing zip file', () => {
      expect(() => {
        ZipHelper.readFromZip('nonexistent.zip', 'file.txt');
      }).toThrow('ZIP file does not exist');
    });
  });

  describe('extractFromZip', () => {
    it('should throw error for non-existing zip file', () => {
      expect(() => {
        ZipHelper.extractFromZip('nonexistent.zip', 'file.txt', 'dest.txt');
      }).toThrow('ZIP file does not exist');
    });
  });

  describe('deleteFromZip', () => {
    it('should throw error for non-existing zip file', () => {
      expect(() => {
        ZipHelper.deleteFromZip('nonexistent.zip', 'file.txt');
      }).toThrow('ZIP file does not exist');
    });
  });
});
