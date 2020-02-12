/* eslint-disable max-statements */

const assume = require('assume');
const stdMocks = require('std-mocks');
const PackageJson = require('../../../src/scaffold/config-builder');

const pluginOne = {
  name: 'gasket-plugin-one'
};
const pluginTwo = {
  name: 'gasket-plugin-two'
};

describe('PackageJson', () => {
  let pkg;

  beforeEach(() => {
    pkg = PackageJson.createPackageJson();
  });

  describe('.add(key, value)', () => {
    it('adds new fields', () => {
      pkg.add('name', 'my-app');

      assume(pkg.fields).property('name', 'my-app');
    });

    it('overrides existing fields', () => {
      pkg.add('name', 'my-app');
      assume(pkg.fields).property('name', 'my-app');
      pkg.add('name', 'my-other-app');
      assume(pkg.fields).property('name', 'my-other-app');
    });

    it('ignores unexpected fields', () => {
      assume(() => pkg.add('bogus')).does.not.throw();
      assume(pkg).not.includes('bogus');
    });

    it('[object] adds new fields', () => {
      pkg.add('scripts', { start: 'gasket start' });

      assume(pkg.fields.scripts).eqls({ start: 'gasket start' });
    });

    it('[object] merges existing fields', () => {
      pkg.add('scripts', { start: 'gasket start' });
      assume(pkg.fields.scripts).eqls({ start: 'gasket start' });
      pkg.add('scripts', { local: 'gasket local' });

      assume(pkg.fields.scripts).eqls({
        start: 'gasket start',
        local: 'gasket local'
      });
    });

    it('[object] merges existing array in object field', () => {
      pkg.add('config', { options: [1, 2, 3] });
      assume(pkg.fields.config.options).eqls([1, 2, 3]);
      pkg.add('config', { options: [4, 5, 6] });
      assume(pkg.fields.config.options).eqls([1, 2, 3, 4, 5, 6]);
    });

    it('[object] throws if scripts is not an object', () => {
      assume(() => {
        pkg.add('scripts', 'bad value');
      }).throws(/must be an object/);
    });

    it('[object] throws if dependencies is not an object', () => {
      assume(() => {
        pkg.add('dependencies', 'bad value');
      }).throws(/must be an object/);
    });

    it('[semver] adds new fields', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });

      assume(pkg.fields.dependencies).eqls({ 'some-pkg': 'latest' });
    });

    it('[semver] merges existing fields', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': 'latest' });
      pkg.add('dependencies', { 'some-other-pkg': '^0.1.2' });
      assume(pkg.fields.dependencies).eqls({
        'some-pkg': 'latest',
        'some-other-pkg': '^0.1.2'
      });
    });

    it('[semver] overwrites existing values with newer semver ranges', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^1.5.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.5.0' });
    });

    it('[semver] does not overwrite existing values older semver ranges', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^1.0.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] appends to blame when identical semver ranges provided', () => {
      pkg.source = { name: 'First plugin' };
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });

      pkg.source = { name: 'Second plugin' };
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });

      assume(pkg.blame.get(`dependencies.some-pkg`)).deep.equals([
        'First plugin',
        'Second plugin'
      ]);
    });

    it('[semver] uses newer semver range even when conflicting', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^2.0.0' });
    });

    it('[semver] uses "latest" semver range even when conflicting', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': 'latest' });
    });

    it('[semver] uses forced range even when older', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginOne);
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^2.0.0' });
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginTwo, { force: true });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] uses previously forced range even when older', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne, { force: true });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo);
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] first forced range cannot be forced out', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne, { force: true });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo, { force: true });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });
    });

    it('[semver] displays a warning when older range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.2.0' }, pluginOne);
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^2.2.0' });

      // Grab stdout
      stdMocks.use();
      pkg.add('dependencies', { 'some-pkg': '^1.0.0' }, pluginTwo);
      stdMocks.restore();
      const actual = stdMocks.flush();
      const [stderr] = actual.stderr;

      assume(stderr).includes('Conflicting versions for some-pkg in "dependencies"');
      assume(stderr).includes(`^2.2.0 provided by ${pluginOne.name}`);
      assume(stderr).includes(`^1.0.0 provided by ${pluginTwo.name}`);
      assume(stderr).includes('Using ^2.2.0, but');
    });

    it('[semver] displays a warning when newer range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne);
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });

      // Grab stdout
      stdMocks.use();
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo);
      stdMocks.restore();
      const actual = stdMocks.flush();
      const [stderr] = actual.stderr;

      assume(stderr).includes('Conflicting versions for some-pkg in "dependencies"');
      assume(stderr).includes(`^1.2.0 provided by ${pluginOne.name}`);
      assume(stderr).includes(`^2.0.0 provided by ${pluginTwo.name}`);
      assume(stderr).includes('Using ^2.0.0, but');
    });

    it('[semver] displays a warning when previously forced range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginOne, { force: true });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^1.2.0' });

      // Grab stdout
      stdMocks.use();
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginTwo);
      stdMocks.restore();
      const actual = stdMocks.flush();
      const [stderr] = actual.stderr;

      assume(stderr).includes('Conflicting versions for some-pkg in "dependencies"');
      assume(stderr).includes(`^1.2.0 provided by ${pluginOne.name} (forced)`);
      assume(stderr).includes(`^2.0.0 provided by ${pluginTwo.name}`);
      assume(stderr).includes('Using ^1.2.0, but');
    });

    it('[semver] displays a warning when forced range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginOne);
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^2.0.0' });

      // Grab stdout
      stdMocks.use();
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginTwo, { force: true });
      stdMocks.restore();
      const actual = stdMocks.flush();
      const [stderr] = actual.stderr;

      assume(stderr).includes('Conflicting versions for some-pkg in "dependencies"');
      assume(stderr).includes(`^2.0.0 provided by ${pluginOne.name}`);
      assume(stderr).includes(`^1.2.0 provided by ${pluginTwo.name} (forced)`);
      assume(stderr).includes('Using ^1.2.0, but');
    });

    it('[semver] displays a warning when attempted re-force range conflicts', () => {
      pkg.add('dependencies', { 'some-pkg': '^2.0.0' }, pluginOne, { force: true });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': '^2.0.0' });

      // Grab stdout
      stdMocks.use();
      pkg.add('dependencies', { 'some-pkg': '^1.2.0' }, pluginTwo, { force: true });
      stdMocks.restore();
      const actual = stdMocks.flush();
      const [stderr] = actual.stderr;

      assume(stderr).includes('Conflicting versions for some-pkg in "dependencies"');
      assume(stderr).includes(`^2.0.0 provided by ${pluginOne.name} (forced)`);
      assume(stderr).includes(`^1.2.0 provided by ${pluginTwo.name} (cannot be forced)`);
      assume(stderr).includes('Using ^2.0.0, but');
    });

    it('[array] adds new fields', () => {
      pkg.add('keys', ['some-key']);

      assume(pkg.fields.keys).eqls(['some-key']);
    });

    it('[array] merges existing fields deduped', () => {
      pkg.add('keys', ['some-key']);
      assume(pkg.fields.keys).eqls(['some-key']);
      pkg.add('keys', ['some-key', 'some-other-key']);
      assume(pkg.fields.keys).eqls([
        'some-key',
        'some-other-key'
      ]);
    });
  });

  describe('.has(key, value', () => {
    it('finds the value in a plain field', () => {
      pkg.add('name', 'my-app');
      const result = pkg.has('name', 'my-app');
      assume(result).equals(true);
    });

    it('finds the value in an object field', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      const result = pkg.has('dependencies', 'some-pkg');
      assume(result).equals(true);
    });

    it('finds the value in an array field', () => {
      pkg.add('keys', ['value1', 'value2']);
      const result = pkg.has('keys', 'value2');
      assume(result).equals(true);
    });

    it('fails to find the value if nothing exists for the key', () => {
      const result = pkg.has('name', 'my-app');
      assume(result).equals(false);
    });

    it('fails to find if the value doesnt match in a plain field', () => {
      pkg.add('name', 'my-app');
      const result = pkg.has('name', 'my');
      assume(result).equals(false);
    });

    it('fails to find if the value doesnt match in an object field', () => {
      pkg.add('dependencies', { 'some-pkg': 'latest' });
      const result = pkg.has('dependencies', 'some');
      assume(result).equals(false);
    });

    it('fails to find if the value doesnt match in an array field', () => {
      pkg.add('keys', ['value1', 'value2']);
      const result = pkg.has('keys', 'value');
      assume(result).equals(false);
    });
  });

  describe('.extend(fields)', () => {
    it('adds new fields', () => {
      pkg.extend({ name: 'my-app' });

      assume(pkg.fields).property('name', 'my-app');
    });

    it('overrides existing fields', () => {
      pkg.extend({ name: 'my-app' });
      assume(pkg.fields).property('name', 'my-app');
      pkg.extend({ name: 'my-other-app' });
      assume(pkg.fields).property('name', 'my-other-app');
    });

    it('ignores unexpected values', () => {
      const fields = Object.assign({}, pkg.fields);
      assume(() => pkg.extend('bogus')).does.not.throw();
      assume(fields).deep.equals(pkg.fields);
    });

    it('[object] adds new fields', () => {
      pkg.extend({ scripts: { start: 'gasket start' } });
      assume(pkg.fields.scripts).eqls({ start: 'gasket start' });
    });

    it('[object] merges existing fields', () => {
      pkg.extend({ scripts: { start: 'gasket start' } });
      assume(pkg.fields.scripts).eqls({ start: 'gasket start' });
      pkg.extend({ scripts: { local: 'gasket local' } });
      assume(pkg.fields.scripts).eqls({
        start: 'gasket start',
        local: 'gasket local'
      });
    });

    it('[object] throws if scripts is not an object', () => {
      assume(() => {
        pkg.extend({ scripts: 'bad value' });
      }).throws(/must be an object/);
    });

    it('[semver] merges existing fields', () => {
      pkg.extend({ dependencies: { 'some-pkg': 'latest' } });
      assume(pkg.fields.dependencies).eqls({ 'some-pkg': 'latest' });
      pkg.extend({ dependencies: { 'some-other-pkg': '^0.1.2' } });
      assume(pkg.fields.dependencies).eqls({
        'some-pkg': 'latest',
        'some-other-pkg': '^0.1.2'
      });
    });

    it('[semver] throws if dependencies is not an object', () => {
      assume(() => {
        pkg.extend({ dependencies: 'bad value' });
      }).throws(/must be an object/);
    });

    it('[array] adds new array fields', () => {
      pkg.extend({ keys: ['some-key'] });

      assume(pkg.fields.keys).eqls(['some-key']);
    });

    it('[array] merges existing fields deduped', () => {
      pkg.extend({ keys: ['some-key'] });
      assume(pkg.fields.keys).eqls(['some-key']);
      pkg.extend({ keys: ['some-key', 'some-other-key'] });
      assume(pkg.fields.keys).eqls([
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
      assume(pkg.fields).eqls({
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
      assume(pkg.fields).eqls({
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
        assume(current).eqls({
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
      assume(pkg.fields).eqls({
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
      assume(() => { // eslint-disable-next-line max-nested-callbacks
        pkg.extend(function () { return false; });
      }).does.not.throw();
      assume(fields).deep.equals(pkg.fields);
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

      assume(ordered).deep.equals({ a: 100, b: 30, c: 2, zzz: 50 });
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

      assume(ordered).deep.equals({
        name: 'yes',
        version: '1.2.3',
        scripts: {},
        dependencies: {},
        devDependencies: {},
        whatever: 'ok'
      });
    });
  });
});
