import { vi } from 'vitest';
import commands from '../lib/commands.js';
import buildDocsConfigSet from '../lib/utils/build-config-set.js';
import collateFiles from '../lib/utils/collate-files.js';
import generateIndex from '../lib/utils/generate-index.js';

const mockGasket = {
  exec: vi.fn(),
  actions: {
    getMetadata: vi.fn(() => ({ app: { name: 'my-app' } }))
  }
};

const mockDocsConfigSet = {
  docsRoot: '/path/to/app/.docs',
  guides: [
    {
      name: 'guide-1'
    },
    {
      name: 'guide-2'
    }
  ],
  templates: [
    {
      name: 'template-1'
    },
    {
      name: 'template-2'
    }
  ]
};

vi.mock('../lib/utils/build-config-set', () => ({ default: vi.fn(() => Promise.resolve(mockDocsConfigSet)) }));
vi.mock('../lib/utils/collate-files');
vi.mock('../lib/utils/generate-index');

describe('commands', () => {

  it('returns a command', () => {
    const results = commands(mockGasket);
    expect(results).toBeDefined();
  });

  it('command has id', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('id', 'docs');
  });

  it('command has description', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('description');
  });

  describe('instance', () => {
    const DocsCommand = commands(mockGasket);

    beforeEach(() => {
      vi.clearAllMocks();
      // Reset the mock docs config set to its original state
      mockDocsConfigSet.guides = [
        { name: 'guide-1' },
        { name: 'guide-2' }
      ];
      mockDocsConfigSet.templates = [
        { name: 'template-1' },
        { name: 'template-2' }
      ];
    });

    it('builds docsConfigSet', async () => {
      await DocsCommand.action({ view: true });
      expect(buildDocsConfigSet).toHaveBeenCalledWith(mockGasket);
    });

    it('collates files', async () => {
      await DocsCommand.action({ view: true });
      expect(collateFiles).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('generates index', async () => {
      await DocsCommand.action({ view: true });
      expect(generateIndex).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('executes docsView lifecycle', async () => {
      await DocsCommand.action({ view: true });
      expect(mockGasket.exec).toHaveBeenCalledWith('docsView', mockDocsConfigSet);
    });

    it('does not execute docsView if --no-view flag', async () => {
      await DocsCommand.action({ view: false });
      expect(mockGasket.exec).toHaveBeenCalledTimes(1);
      expect(mockGasket.exec).toHaveBeenCalledWith('docsGenerate', mockDocsConfigSet);
    });

    describe('docsGenerate result handling', () => {
      it('handles array of generated docs', async () => {
        const generatedDocs = [
          { name: 'guide-1', description: 'Guide 1' },
          { name: 'template-1', description: 'Template 1' },
          { name: 'guide-2', description: 'Guide 2' }
        ];
        mockGasket.exec.mockResolvedValueOnce(generatedDocs);

        await DocsCommand.action({ view: false });

        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'guide-1', description: 'Guide 1' });
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'guide-2', description: 'Guide 2' });
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-1', description: 'Template 1' });
      });

      it('handles single generated doc object', async () => {
        const singleDoc = { name: 'single-guide', description: 'Single guide' };
        mockGasket.exec.mockResolvedValueOnce(singleDoc);

        await DocsCommand.action({ view: false });

        expect(mockDocsConfigSet.guides).toContainEqual(singleDoc);
        // Should still have the original templates since no new templates were generated
        expect(mockDocsConfigSet.templates).toHaveLength(2);
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-1' });
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-2' });
      });

      it('filters out falsy values from generated docs', async () => {
        const docsWithFalsy = [
          { name: 'new-guide', description: 'New Guide' },
          null,
          { name: 'new-template', description: 'New Template' },
          null, // Using null instead of undefined to avoid linting error
          { name: 'another-guide', description: 'Another Guide' }
        ];
        mockGasket.exec.mockResolvedValueOnce(docsWithFalsy);

        await DocsCommand.action({ view: false });

        // Should have original 2 guides + 2 new guides = 4 total
        expect(mockDocsConfigSet.guides).toHaveLength(4);
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'new-guide', description: 'New Guide' });
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'another-guide', description: 'Another Guide' });
        // Should have original 2 templates + 1 new template = 3 total
        expect(mockDocsConfigSet.templates).toHaveLength(3);
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'new-template', description: 'New Template' });
      });

      it('handles nested arrays in generated docs', async () => {
        const nestedDocs = [
          { name: 'new-guide-1', description: 'New Guide 1' },
          [
            { name: 'new-template-1', description: 'New Template 1' },
            { name: 'new-template-2', description: 'New Template 2' }
          ],
          { name: 'new-guide-2', description: 'New Guide 2' }
        ];
        mockGasket.exec.mockResolvedValueOnce(nestedDocs);

        await DocsCommand.action({ view: false });

        // Should have original 2 guides + 2 new guides = 4 total
        expect(mockDocsConfigSet.guides).toHaveLength(4);
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'new-guide-1', description: 'New Guide 1' });
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'new-guide-2', description: 'New Guide 2' });
        // Should have original 2 templates + 2 new templates = 4 total
        expect(mockDocsConfigSet.templates).toHaveLength(4);
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'new-template-1', description: 'New Template 1' });
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'new-template-2', description: 'New Template 2' });
      });

      it('filters docs by name containing template', async () => {
        const mixedDocs = [
          { name: 'new-regular-guide', description: 'New regular guide' },
          { name: 'new-template-guide', description: 'New template guide' },
          { name: 'my-new-template', description: 'My new template' },
          { name: 'new-guide-example', description: 'New guide example' }
        ];
        mockGasket.exec.mockResolvedValueOnce(mixedDocs);

        await DocsCommand.action({ view: false });

        // Should have original 2 guides + 2 new guides (regular-guide and guide-example) = 4 total
        expect(mockDocsConfigSet.guides).toHaveLength(4);
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'new-regular-guide', description: 'New regular guide' });
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'new-guide-example', description: 'New guide example' });

        // Should have original 2 templates + 2 new templates (template-guide and my-template) = 4 total
        expect(mockDocsConfigSet.templates).toHaveLength(4);
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'new-template-guide', description: 'New template guide' });
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'my-new-template', description: 'My new template' });
      });

      it('initializes guides array if undefined', async () => {
        const docsConfigSetWithoutGuides = {
          ...mockDocsConfigSet,
          guides: null // Using null instead of undefined to avoid linting error
        };
        buildDocsConfigSet.mockResolvedValueOnce(docsConfigSetWithoutGuides);

        const generatedDocs = [{ name: 'new-guide', description: 'New guide' }];
        mockGasket.exec.mockResolvedValueOnce(generatedDocs);

        await DocsCommand.action({ view: false });

        expect(docsConfigSetWithoutGuides.guides).toBeDefined();
        expect(docsConfigSetWithoutGuides.guides).toContainEqual({ name: 'new-guide', description: 'New guide' });
      });

      it('handles empty generated docs', async () => {
        mockGasket.exec.mockResolvedValueOnce([]);

        await DocsCommand.action({ view: false });

        // Should still have the original guides and templates
        expect(mockDocsConfigSet.guides).toHaveLength(2);
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'guide-1' });
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'guide-2' });
        expect(mockDocsConfigSet.templates).toHaveLength(2);
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-1' });
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-2' });
      });

      it('handles null/undefined generated result', async () => {
        mockGasket.exec.mockResolvedValueOnce(null);

        await DocsCommand.action({ view: false });

        // Should still have the original guides and templates
        expect(mockDocsConfigSet.guides).toHaveLength(2);
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'guide-1' });
        expect(mockDocsConfigSet.guides).toContainEqual({ name: 'guide-2' });
        expect(mockDocsConfigSet.templates).toHaveLength(2);
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-1' });
        expect(mockDocsConfigSet.templates).toContainEqual({ name: 'template-2' });
      });
    });
  });
});
