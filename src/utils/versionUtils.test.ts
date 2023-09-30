import { VersionUtils } from './versionUtils';

describe('VersionUtils', () => {
  describe('WHEN there is a "v" prefix', () => {
    it('SHOULD sort versions from more recent to older', () => {
      const firstVersion = 'v2.1.0';
      const secontVersion = 'v1.4.2';
      const thirdVersion = 'v1.0.12';
      expect(VersionUtils.sortSemver([thirdVersion, firstVersion, secontVersion]))
        .toEqual([firstVersion, secontVersion, thirdVersion]);
    });

    it('SHOULD tell if current version is more recent than the other', () =>{
      expect(VersionUtils.isMoreRecent('v2.0.0', 'v1.0.0')).toBeTrue();
      expect(VersionUtils.isMoreRecent('v1.1.0', 'v1.0.0')).toBeTrue();
      expect(VersionUtils.isMoreRecent('v1.0.1', 'v1.0.0')).toBeTrue();
    });

    it('SHOULD tell if current version is older than the other', () => {
      expect(VersionUtils.isMoreRecent('v1.0.0', 'v2.0.0')).toBeFalse();
      expect(VersionUtils.isMoreRecent('v1.0.0', 'v1.1.0')).toBeFalse();
      expect(VersionUtils.isMoreRecent('v1.0.0', 'v1.0.1')).toBeFalse();
    });
  });

  describe('WHEN there are no prefix', () => {
    it('SHOULD sort versions from more recent to older', () => {
      const firstVersion = '2.1.0';
      const secontVersion = '1.4.2';
      const thirdVersion = '1.0.12';
      expect(VersionUtils.sortSemver([thirdVersion, firstVersion, secontVersion]))
        .toEqual([firstVersion, secontVersion, thirdVersion]);
    });

    it('SHOULD tell if current version is more recent than the other', () =>{
      expect(VersionUtils.isMoreRecent('2.0.0', '1.0.0')).toBeTrue();
      expect(VersionUtils.isMoreRecent('1.1.0', '1.0.0')).toBeTrue();
      expect(VersionUtils.isMoreRecent('1.0.1', '1.0.0')).toBeTrue();
    });

    it('SHOULD tell if current version is older than the other', () => {
      expect(VersionUtils.isMoreRecent('1.0.0', '2.0.0')).toBeFalse();
      expect(VersionUtils.isMoreRecent('1.0.0', '1.1.0')).toBeFalse();
      expect(VersionUtils.isMoreRecent('1.0.0', '1.0.1')).toBeFalse();
    });
  });
});
