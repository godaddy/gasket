/* eslint-disable max-statements */

const ConfigBuilder = require('../../../src/scaffold/config-builder');

const pluginOne = {
  name: 'gasket-plugin-one'
};
const pluginTwo = {
  name: 'gasket-plugin-two'
};

describe('ConfigBuilder', () => {
  let pkg, warnSpy, consoleWarnStub;

  beforeEach(() => {
    pkg = ConfigBuilder.createPackageJson();
    warnSpy = jest.spyOn(pkg, 'warn');
    consoleWarnStub = jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('.add(key, value)', () => {
    it('adds new fields', () => {
      pkg.add('name', 'my-app');

      expect(pkg.fields).toHaveProperty('name', 'my-app');
    });

    it('overrides existing fields', () => {
      pkg.add('name', 'my-app');
      expect(pkg.fields).toHaveProperty('name', 'my-app');
      pkg.add('name', 'my-other-app');
      expect(pkg.fields).toHaveProperty('name', 'my-other-app');
    });

    it('ignores unexpected fields', () => {
      expect(() => pkg.add('bogus')).not.toThrow();
      expect(pkg).not.toContain('bogus');
    });

    it('[object] adds new fields', () => {
      pkg.add('scripts', { start: 'gasket start' });

      expect(pkg.fields.scripts).toEqual({ start: 'gasket start' });
    });

    it('[object] merges existing fields', () => {
      pkg.add('scripts', { start: 'gasket start' });
      expect(pkg.fields.scripts).toEqual({ start: 'gasket start' });
      pkg.add('scripts', { local: 'gasket local' });

      expect(pkg.fields.scripts).toEqual({
        start: 'gasket start',
        local: 'gasket local'
      });
    });

    it('[object] merges existing array in object field', () => {
      pkg.add('config', { options: [1, 2, 3] });
      expect(pkg.fields.config.options).toEqual([1, 2, 3]);
      pkg.add('config', { options: [4, 5, 6] });
      expect(pkg.fields.config.options).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('[object] throws if scripts is not an object', () => {
      expect(() => {
        pkg.add('scripts', 'bad value');
      }).toThrow(/must be an object/);
    });

    it('[object] throws if dependencies is not an object', () => {
      expect(() => {
        pkg.add('dependencies', 'bad value');
      }).toThrow(/must be an object/);
    });

    it('[semver] adds new fields', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });

      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': 'latest' });
    });

    it('[semver] merges existing fields', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': 'latest' });
      pkg.add('dependencies', { 'some-other-pkg': '^0.1.2' });
      expect(pkg.fields.dependencies).toEqual({
        'some-pkg': 'latest',
        'some-other-pkg': '^0.1.2'
      });
    });

    it('[semver] overwrites existing values with newer semver ranges', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^1.5.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.5.0' });
    });

    it('[semver] does not overwrite existing values older semver ranges', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^1.0.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] appends to blame when identical semver ranges provided', () => {
      pkg.source = { name: 'First plugin' };
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });

      pkg.source = { name: 'Second plugin' };
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });

      expect(pkg.blame.get(`dependencies.some-pkg`)).toEqual(expect.arrayContaining([
        'First plugin',
        'Second plugin'
      ]));
    });

    it('[semver] uses newer semver range even when conflicting', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^2.0.0' });
    });

    it('[semver] uses "latest" semver range even when conflicting', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': 'latest' });
    });

    it('[semver] uses forced range even when older', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginOne);
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^2.0.0' });
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginTwo, { force: true });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] uses previously forced range even when older', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne, { force: true });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo);
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] first forced range cannot be forced out', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne, { force: true });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo, { force: true });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] warns when older range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.2.0' }, pluginOne);
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^2.2.0' });

      pkg.add('dependencies', { 'some-pkg': '^1.0.0' }, pluginTwo);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Conflicting versions for some-pkg in "dependencies"'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^2.2.0 provided by ${pluginOne.name}`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^1.0.0 provided by ${pluginTwo.name}`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Using ^2.2.0, but'));
    });

    it('[semver] warns when newer range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne);
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });

      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Conflicting versions for some-pkg in "dependencies"'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^1.2.0 provided by ${pluginOne.name}`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^2.0.0 provided by ${pluginTwo.name}`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Using ^2.0.0, but'));
    });

    it('[semver] warns when previously forced range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne, { force: true });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^1.2.0' });

      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Conflicting versions for some-pkg in "dependencies"'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^1.2.0 provided by ${pluginOne.name} (forced)`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^2.0.0 provided by ${pluginTwo.name}`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Using ^1.2.0, but'));
    });

    it('[semver] warns when forced range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginOne);
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^2.0.0' });

      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginTwo, { force: true });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Conflicting versions for some-pkg in "dependencies"'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^2.0.0 provided by ${pluginOne.name}`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^1.2.0 provided by ${pluginTwo.name} (forced)`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Using ^1.2.0, but'));
    });

    it('[semver] warns when attempted re-force range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginOne, { force: true });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': '^2.0.0' });

      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginTwo, { force: true });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Conflicting versions for some-pkg in "dependencies"'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^2.0.0 provided by ${pluginOne.name} (forced)`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`^1.2.0 provided by ${pluginTwo.name} (cannot be forced)`));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Using ^2.0.0, but'));
    });

    it('[array] adds new fields', () => {
      pkg.add('keys', ['some-key']);

      expect(pkg.fields.keys).toEqual(['some-key']);
    });

    it('[array] merges existing fields deduped', () => {
      pkg.add('keys', ['some-key']);
      expect(pkg.fields.keys).toEqual(['some-key']);
      pkg.add('keys', ['some-key', 'some-other-key']);
      expect(pkg.fields.keys).toEqual([
        'some-key',
        'some-other-key'
      ]);
    });
  });

  describe('.has(key, value', () => {
    it('finds the value in a plain field', () => {
      pkg.add('name', 'my-app');
      const result = pkg.has('name', 'my-app');
      expect(result).toEqual(true);
    });

    it('finds the value in an object field', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      const result = pkg.has('dependencies', 'some-pkg');
      expect(result).toEqual(true);
    });

    it('finds the value in an array field', () => {
      pkg.add('keys', ['value1', 'value2']);
      const result = pkg.has('keys', 'value2');
      expect(result).toEqual(true);
    });

    it('fails to find the value if nothing exists for the key', () => {
      const result = pkg.has('name', 'my-app');
      expect(result).toEqual(false);
    });

    it('fails to find if the value doesnt match in a plain field', () => {
      pkg.add('name', 'my-app');
      const result = pkg.has('name', 'my');
      expect(result).toEqual(false);
    });

    it('fails to find if the value doesnt match in an object field', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      const result = pkg.has('dependencies', 'some');
      expect(result).toEqual(false);
    });

    it('fails to find if the value doesnt match in an array field', () => {
      pkg.add('keys', ['value1', 'value2']);
      const result = pkg.has('keys', 'value');
      expect(result).toEqual(false);
    });
  });

  describe('.extend(fields)', () => {
    it('adds new fields', () => {
      pkg.extend({ name: 'my-app' });

      expect(pkg.fields).toHaveProperty('name', 'my-app');
    });

    it('overrides existing fields', () => {
      pkg.extend({ name: 'my-app' });
      expect(pkg.fields).toHaveProperty('name', 'my-app');
      pkg.extend({ name: 'my-other-app' });
      expect(pkg.fields).toHaveProperty('name', 'my-other-app');
    });

    it('ignores unexpected values', () => {
      const fields = Object.assign({}, pkg.fields);
      expect(() => pkg.extend('bogus')).not.toThrow();
      expect(fields).toEqual(expect.objectContaining(pkg.fields));
    });

    it('[object] adds new fields', () => {
      pkg.extend({ scripts: { start: 'gasket start' } });
      expect(pkg.fields.scripts).toEqual({ start: 'gasket start' });
    });

    it('[object] merges existing fields', () => {
      pkg.extend({ scripts: { start: 'gasket start' } });
      expect(pkg.fields.scripts).toEqual({ start: 'gasket start' });
      pkg.extend({ scripts: { local: 'gasket local' } });
      expect(pkg.fields.scripts).toEqual({
        start: 'gasket start',
        local: 'gasket local'
      });
    });

    it('[object] throws if scripts is not an object', () => {
      expect(() => {
        pkg.extend({ scripts: 'bad value' });
      }).toThrow(/must be an object/);
    });

    it('[semver] merges existing fields', () => {
      pkg.extend({ dependencies: { 'some-pkg': 'latest' } });
      expect(pkg.fields.dependencies).toEqual({ 'some-pkg': 'latest' });
      pkg.extend({ dependencies: { 'some-other-pkg': '^0.1.2' } });
      expect(pkg.fields.dependencies).toEqual({
        'some-pkg': 'latest',
        'some-other-pkg': '^0.1.2'
      });
    });

    it('[semver] throws if dependencies is not an object', () => {
      expect(() => {
        pkg.extend({ dependencies: 'bad value' });
      }).toThrow(/must be an object/);
    });

    it('[array] adds new array fields', () => {
      pkg.extend({ keys: ['some-key'] });

      expect(pkg.fields.keys).toEqual(['some-key']);
    });

    it('[array] merges existing fields deduped', () => {
      pkg.extend({ keys: ['some-key'] });
      expect(pkg.fields.keys).toEqual(['some-key']);
      pkg.extend({ keys: ['some-key', 'some-other-key'] });
      expect(pkg.fields.keys).toEqual([
        'some-key',
        'some-other-key'
      ]);
    });

    it('[multiple] adds multiple field types', () => {
      pkg.extend({
        name: 'my-app',
        dependencies: { 'some-pkg': 'latest' },
        keys: ['some-key']
      });
      expect(pkg.fields).toEqual({
        name: 'my-app',
        dependencies: { 'some-pkg': 'latest' },
        keys: ['some-key']
      });
    });

    it('[multiple] merges multiple field types', () => {
      pkg.extend({
        name: 'my-app',
        dependencies: { 'some-pkg': 'latest' },
        keys: ['some-key']
      });
      pkg.extend({
        name: 'my-other-app',
        dependencies: { 'some-other-pkg': '^0.1.2' },
        keys: ['some-other-key']
      });
      expect(pkg.fields).toEqual({
        name: 'my-other-app',
        dependencies: {
          'some-pkg': 'latest',
          'some-other-pkg': '^0.1.2'
        },
        keys: [
          'some-key',
          'some-other-key'
        ]
      });
    });

    it('[function] argument can be a function that accepts current fields', () => {
      pkg.extend({
        name: 'my-app',
        dependencies: { 'some-pkg': 'latest' },
        keys: ['some-key']
      });
      pkg.extend(current => {
        expect(current).toEqual({
          name: 'my-app',
          dependencies: { 'some-pkg': 'latest' },
          keys: ['some-key']
        });
        return {
          name: 'my-other-app',
          dependencies: { 'some-other-pkg': '^0.1.2' },
          keys: ['some-other-key']
        };
      });
      expect(pkg.fields).toEqual({
        name: 'my-other-app',
        dependencies: {
          'some-pkg': 'latest',
          'some-other-pkg': '^0.1.2'
        },
        keys: [
          'some-key',
          'some-other-key'
        ]
      });
    });

    it('[function] ignores falsey values returned from functions', () => {
      const fields = Object.assign({}, pkg.fields);
      expect(() => { // eslint-disable-next-line max-nested-callbacks
        pkg.extend(function () { return false; });
      }).not.toThrow();
      expect(fields).toEqual(expect.objectContaining(pkg.fields));
    });
  });

  describe('.toOrderedKeys(obj, [orderBy])', () => {
    it('should order lexographically by default', () => {
      const ordered = pkg.toOrderedKeys({
        c: 2,
        a: 100,
        b: 30,
        zzz: 50
      });

      expect(ordered).toEqual(expect.objectContaining({ a: 100, b: 30, c: 2, zzz: 50 }));
    });

    it('should accept a fixed order', () => {
      const obj = {
        whatever: 'ok',
        version: '1.2.3',
        dependencies: {},
        name: 'yes',
        scripts: {},
        devDependencies: {}
      };

      const ordered = pkg.toOrderedKeys(obj, [
        'name',
        'version',
        'scripts',
        'dependencies',
        'devDependencies'
      ]);

      expect(ordered).toEqual(expect.objectContaining({
        name: 'yes',
        version: '1.2.3',
        scripts: {},
        dependencies: {},
        devDependencies: {},
        whatever: 'ok'
      }));
    });
  });

  describe('.warn(message)', () => {
    let warnings;

    beforeEach(() => {
      warnings = [];
    });

    it('logs to console if no warnings array in options', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.2.0' }, pluginOne);
      pkg.add('dependencies', { 'some-pkg': '^1.0.0' }, pluginTwo);

      expect(warnSpy).toHaveBeenCalled();
      expect(consoleWarnStub).toHaveBeenCalled();
      expect(warnings).toHaveLength(0);
    });

    it('adds to warnings array if exists instead of console', () => {
      pkg = ConfigBuilder.createPackageJson({}, { warnings });
      warnSpy = jest.spyOn(pkg, 'warn');

      pkg.add('dependencies', { 'some-pkg': '^2.2.0' }, pluginOne);
      pkg.add('dependencies', { 'some-pkg': '^1.0.0' }, pluginTwo);

      expect(warnSpy).toHaveBeenCalled();
      expect(consoleWarnStub).not.toHaveBeenCalled();
      expect(warnings).toHaveLength(1);
    });
  });
});
