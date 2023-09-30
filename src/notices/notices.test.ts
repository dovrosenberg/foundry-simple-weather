import { Foundry } from '../libraries/foundry/foundry';
import { ModuleSettings } from '../settings/module-settings';
import { gameMock, mockClass } from '../utils/testUtils';
import { Notices } from './notices';

const A_VERSION = '1.2.3';
const ANOTHER_VERSION = '1.2.4';
const AN_OLDER_VERSION = '1.1.0';

describe('Notices', () => {
  let notices: Notices;
  let gameRef;
  let settings;

  beforeEach(() => {
    gameRef = gameMock();
    settings = mockClass(ModuleSettings);
    notices = new Notices(gameRef, settings);
    notices['spawnNotice'] = jest.fn();
  });

  function spawnNoticeSpy() {
    return notices['spawnNotice'];
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  it('SHOULD open a notices dialog WHEN the current version has one', async () => {
    settings.getVersion.mockReturnValue(A_VERSION);
    settings.getVersionsWithNotices.mockReturnValue([A_VERSION]);
    settings.getListOfReadNoticesVersions = jest.fn().mockReturnValue([]);
    givenAMockOfSrcExists([A_VERSION]);

    await notices.checkForNotices();

    expect(spawnNoticeSpy()).toHaveBeenCalledWith(A_VERSION);
  });

  it('SHOULD NOT open a dialog WHEN the current version is already read', async () => {
    settings.getVersion.mockReturnValue(A_VERSION);
    settings.getVersionsWithNotices.mockReturnValue([A_VERSION]);
    settings.getListOfReadNoticesVersions = jest.fn().mockReturnValue([A_VERSION]);
    givenAMockOfSrcExists([A_VERSION]);

    await notices.checkForNotices();

    expect(spawnNoticeSpy()).not.toHaveBeenCalled();
  });

  it('SHOULD open a notice for the previous version WHEN the current version does not have one', async () => {
    settings.getVersion.mockReturnValue(A_VERSION);
    settings.getVersionsWithNotices.mockReturnValue([AN_OLDER_VERSION]);
    settings.getListOfReadNoticesVersions = jest.fn().mockReturnValue([]);
    givenAMockOfSrcExists([AN_OLDER_VERSION]);

    await notices.checkForNotices();

    expect(spawnNoticeSpy()).toHaveBeenCalledWith(AN_OLDER_VERSION);
  });

  it('SHOULD NOT open a notice for the previous version WHEN it is already read', async () => {
    settings.getVersion.mockReturnValue(A_VERSION);
    settings.getVersionsWithNotices.mockReturnValue([AN_OLDER_VERSION]);
    settings.getListOfReadNoticesVersions = jest.fn().mockReturnValue([AN_OLDER_VERSION]);
    givenAMockOfSrcExists([AN_OLDER_VERSION]);

    await notices.checkForNotices();

    expect(spawnNoticeSpy()).not.toHaveBeenCalled();
  });

  it('SHOULD NOT open a notice for the previous version WHEN the notice of the current version is already read', async () => {
    settings.getVersion.mockReturnValue(A_VERSION);
    settings.getVersionsWithNotices.mockReturnValue([A_VERSION, AN_OLDER_VERSION]);
    settings.getListOfReadNoticesVersions = jest.fn().mockReturnValue([A_VERSION]);
    givenAMockOfSrcExists([A_VERSION, AN_OLDER_VERSION]);

    await notices.checkForNotices();

    expect(spawnNoticeSpy()).not.toHaveBeenCalled();
  });

  it('SHOULD not check for the notice file WHEN the current version does not have a declared notice', async () => {
    const srcExistsSpy = jest.fn();
    Foundry.srcExists = srcExistsSpy;
    settings.getVersion.mockReturnValue(ANOTHER_VERSION);
    settings.getVersionsWithNotices.mockReturnValue([A_VERSION]);
    settings.getListOfReadNoticesVersions.mockReturnValue([A_VERSION]);

    await notices.checkForNotices();

    expect(srcExistsSpy).not.toHaveBeenCalledWith(expect.stringContaining(ANOTHER_VERSION));
  });

  function givenAMockOfSrcExists(existingVersions: Array<string>) {
    Foundry.srcExists = jest.fn().mockImplementation((path: string) => {
      return existingVersions.some((version: string) => {
        return path.includes(version);
      });
    });
  }
});
