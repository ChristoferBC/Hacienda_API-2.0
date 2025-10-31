const fs = require('fs-extra');
const path = require('path');
const invoiceStorage = require('../../src/services/invoiceStorage');

// Mock fs-extra for unit testing
jest.mock('fs-extra');

describe('InvoiceStorage Unit Tests', () => {
  const mockInvoicesDir = '/test/invoices';
  const mockSentDir = '/test/invoices/sent';
  const testConsecutivo = '00100101000000000001';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful directory creation
    fs.ensureDir.mockResolvedValue();
    
    // Mock file system operations
    fs.writeJSON.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.readJSON.mockResolvedValue({});
    fs.readFile.mockResolvedValue('mock xml content');
    fs.copy.mockResolvedValue();
    fs.remove.mockResolvedValue();
    fs.stat.mockResolvedValue({
      size: 1024,
      birthtime: new Date('2023-01-01'),
      mtime: new Date('2023-01-02'),
    });
    fs.readdir.mockResolvedValue([]);
  });

  describe('saveInvoiceJSON', () => {
    it('should save invoice JSON successfully', async () => {
      const mockFacturaData = {
        consecutivo: testConsecutivo,
        clave: 'test-clave',
        estado: 'emitido',
      };

      const result = await invoiceStorage.saveInvoiceJSON(testConsecutivo, mockFacturaData);

      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();
      expect(result).toContain('FACTURA_');
      expect(result).toContain(testConsecutivo);
      expect(result).toContain('.json');
    });

    it('should handle file write errors', async () => {
      fs.writeJSON.mockRejectedValue(new Error('Write error'));

      await expect(invoiceStorage.saveInvoiceJSON(testConsecutivo, {}))
        .rejects
        .toThrow('Error al guardar factura JSON');
    });

    it('should add metadata to saved invoice', async () => {
      const mockFacturaData = { test: 'data' };
      
      await invoiceStorage.saveInvoiceJSON(testConsecutivo, mockFacturaData);

      const writeCall = fs.writeJSON.mock.calls[0];
      const savedData = writeCall[1];
      
      expect(savedData).toHaveProperty('metadata');
      expect(savedData.metadata).toHaveProperty('savedAt');
      expect(savedData.metadata).toHaveProperty('filename');
      expect(savedData.metadata).toHaveProperty('format', 'JSON');
    });
  });

  describe('saveInvoiceXML', () => {
    it('should save invoice XML successfully', async () => {
      const mockXmlContent = '<?xml version="1.0"?><factura></factura>';

      const result = await invoiceStorage.saveInvoiceXML(testConsecutivo, mockXmlContent);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('FACTURA_'),
        mockXmlContent,
        'utf8'
      );
      expect(result).toContain('.xml');
    });

    it('should handle XML write errors', async () => {
      fs.writeFile.mockRejectedValue(new Error('Write error'));

      await expect(invoiceStorage.saveInvoiceXML(testConsecutivo, 'xml'))
        .rejects
        .toThrow('Error al guardar factura XML');
    });
  });

  describe('markAsSent', () => {
    beforeEach(() => {
      // Mock finding invoice files
      fs.readdir.mockResolvedValue([
        `FACTURA_${testConsecutivo}_2023-01-01.json`,
        `FACTURA_${testConsecutivo}.xml`,
      ]);
    });

    it('should mark invoice as sent successfully', async () => {
      const envioMeta = {
        timestamp: new Date().toISOString(),
        response: 'success',
      };

      const result = await invoiceStorage.markAsSent(testConsecutivo, envioMeta);

      expect(result).toHaveProperty('moved');
      expect(result).toHaveProperty('errors');
      expect(result.moved.length).toBeGreaterThan(0);
      expect(fs.copy).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();
    });

    it('should handle case when no files are found', async () => {
      fs.readdir.mockResolvedValue([]);

      await expect(invoiceStorage.markAsSent(testConsecutivo))
        .rejects
        .toThrow('No se encontraron archivos');
    });

    it('should handle file copy errors gracefully', async () => {
      fs.copy.mockRejectedValueOnce(new Error('Copy error'));

      const result = await invoiceStorage.markAsSent(testConsecutivo);

      expect(result).toHaveProperty('errors');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getInvoice', () => {
    beforeEach(() => {
      fs.readdir.mockResolvedValue([
        `FACTURA_${testConsecutivo}_2023-01-01.json`,
        `FACTURA_${testConsecutivo}.xml`,
      ]);

      fs.readJSON.mockResolvedValue({
        consecutivo: testConsecutivo,
        clave: 'test-clave',
      });

      fs.readFile.mockResolvedValue('<xml>content</xml>');
    });

    it('should get invoice successfully', async () => {
      const result = await invoiceStorage.getInvoice(testConsecutivo);

      expect(result).toHaveProperty('consecutivo', testConsecutivo);
      expect(result).toHaveProperty('files');
      expect(result).toHaveProperty('metadata');
      expect(result.files).toHaveProperty('json');
      expect(result.files).toHaveProperty('xml');
    });

    it('should handle case when invoice is not found', async () => {
      fs.readdir.mockResolvedValue([]);

      await expect(invoiceStorage.getInvoice(testConsecutivo))
        .rejects
        .toThrow('Factura no encontrada');
    });

    it('should handle file read errors gracefully', async () => {
      fs.readJSON.mockRejectedValue(new Error('Read error'));

      const result = await invoiceStorage.getInvoice(testConsecutivo);

      expect(result).toHaveProperty('consecutivo');
      // Should still return result even if some files fail to read
    });
  });

  describe('listInvoices', () => {
    beforeEach(() => {
      fs.readdir
        .mockResolvedValueOnce([
          'FACTURA_00100101000000000001_2023-01-01.json',
          'FACTURA_00100101000000000002_2023-01-02.json',
          'other-file.txt', // Should be ignored
        ])
        .mockResolvedValueOnce([
          'FACTURA_00100101000000000003_2023-01-03.json',
        ]);
    });

    it('should list all invoices by default', async () => {
      const result = await invoiceStorage.listInvoices();

      expect(Array.isArray(result)).toBe(true);
      expect(fs.readdir).toHaveBeenCalledTimes(2); // Both directories
    });

    it('should filter invoices by status', async () => {
      const result = await invoiceStorage.listInvoices({ status: 'pending' });

      expect(fs.readdir).toHaveBeenCalledTimes(1); // Only main directory
    });

    it('should include content when requested', async () => {
      fs.readJSON.mockResolvedValue({ test: 'content' });

      const result = await invoiceStorage.listInvoices({ includeContent: true });

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('content');
      }
    });
  });

  describe('deleteInvoice', () => {
    beforeEach(() => {
      fs.readdir
        .mockResolvedValueOnce([`FACTURA_${testConsecutivo}_2023-01-01.json`])
        .mockResolvedValueOnce([`FACTURA_${testConsecutivo}.xml`]);
    });

    it('should delete invoice successfully', async () => {
      const result = await invoiceStorage.deleteInvoice(testConsecutivo);

      expect(result).toHaveProperty('deleted');
      expect(result).toHaveProperty('errors');
      expect(result.deleted.length).toBeGreaterThan(0);
      expect(fs.remove).toHaveBeenCalled();
    });

    it('should handle case when no files are found', async () => {
      fs.readdir.mockResolvedValue([]);

      await expect(invoiceStorage.deleteInvoice(testConsecutivo))
        .rejects
        .toThrow('Factura no encontrada');
    });

    it('should handle file deletion errors gracefully', async () => {
      fs.remove.mockRejectedValueOnce(new Error('Delete error'));

      const result = await invoiceStorage.deleteInvoice(testConsecutivo);

      expect(result).toHaveProperty('errors');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getStorageStats', () => {
    beforeEach(() => {
      fs.readdir
        .mockResolvedValueOnce(['FACTURA_001_2023-01-01.json', 'FACTURA_002_2023-01-02.json'])
        .mockResolvedValueOnce(['FACTURA_003_2023-01-03.json']);

      fs.stat.mockResolvedValue({
        size: 1024,
      });
    });

    it('should return storage statistics', async () => {
      const stats = await invoiceStorage.getStorageStats();

      expect(stats).toHaveProperty('directories');
      expect(stats).toHaveProperty('counts');
      expect(stats).toHaveProperty('sizes');
      expect(stats.counts).toHaveProperty('pending');
      expect(stats.counts).toHaveProperty('sent');
      expect(stats.counts).toHaveProperty('total');
    });

    it('should handle directory read errors gracefully', async () => {
      fs.readdir.mockRejectedValue(new Error('Read error'));

      const stats = await invoiceStorage.getStorageStats();

      expect(stats).toHaveProperty('counts');
      expect(stats.counts.pending).toBe(0);
      expect(stats.counts.sent).toBe(0);
    });
  });

  describe('Helper methods', () => {
    it('should extract consecutivo from filename correctly', () => {
      const filename = 'FACTURA_00100101000000000001_2023-01-01.json';
      const consecutivo = invoiceStorage._extractConsecutivoFromFilename(filename);
      
      expect(consecutivo).toBe('00100101000000000001');
    });

    it('should return null for invalid filename', () => {
      const filename = 'invalid-filename.json';
      const consecutivo = invoiceStorage._extractConsecutivoFromFilename(filename);
      
      expect(consecutivo).toBeNull();
    });

    it('should generate valid timestamps', () => {
      const timestamp = invoiceStorage._generateTimestamp();
      
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
    });
  });
});