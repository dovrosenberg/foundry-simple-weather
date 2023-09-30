import { Log } from '@/logger/logger';
import { mockClass } from '@/utils/testUtils';

import { Migrations } from './migrations';
import { Migration } from './migrations/migration';

const EMPTY_DATA = { version: -1 };
const loggerMock = mockClass(Log);
class TestableMigration extends Migration {
  constructor(version: number, private migrationSpy: () => void) {
    super(version);
  }

  public migrate() {
    this.migrationSpy();
  }
}

describe('Migrations', () => {
  it('SHOULD call all version starting from the lowest', () => {
    const migrations = new Migrations(loggerMock);
    const migrationSpy1 = jest.fn();
    const migration1 = new TestableMigration(1, migrationSpy1);
    const migrationSpy2 = jest.fn();
    const migration2 = new TestableMigration(2, migrationSpy2);
    migrations.register(migration2);
    migrations.register(migration1);

    migrations.run(0, EMPTY_DATA);

    expect(migrationSpy1).toHaveBeenCalledBefore(migrationSpy2);
  });

  it('SHOULD run migrations that are superior to the current version', () => {
    const migrations = new Migrations(loggerMock);
    const migrationSpy1 = jest.fn();
    const migration1 = new TestableMigration(1, migrationSpy1);
    const migrationSpy2 = jest.fn();
    const migration2 = new TestableMigration(2, migrationSpy2);
    const migrationSpy3 = jest.fn();
    const migration3 = new TestableMigration(3, migrationSpy3);
    migrations.register(migration2);
    migrations.register(migration1);
    migrations.register(migration3);

    migrations.run(1, EMPTY_DATA);

    expect(migrationSpy1).not.toHaveBeenCalled();
    expect(migrationSpy2).toHaveBeenCalled();
    expect(migrationSpy2).toHaveBeenCalledBefore(migrationSpy3);
  });

  it('SHOULD return false WHEN currentData is invalid', () => {
    const migrations = new Migrations(loggerMock);
    expect(migrations.run(1, String(''))).toBeFalsy();
  });
});
