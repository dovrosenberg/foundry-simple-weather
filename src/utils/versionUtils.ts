export abstract class VersionUtils {
  public static sortSemver(versionList: Array<string>): Array<string> {
    return versionList.sort(this.compareSemver);
  }

  public static isMoreRecent(current, check): boolean {
    const sortedVersions = this.sortSemver([current, check]);
    return sortedVersions.indexOf(current) === 0;
  }

  private static compareSemver(a, b) {
    let i, diff;
    const regExStrip0 = /^[vV]|(\.0+)+$/;
    const segmentsA = a.replace(regExStrip0, '').split('.');
    const segmentsB = b.replace(regExStrip0, '').split('.');
    const l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
      diff = parseInt(segmentsB[i], 10) - parseInt(segmentsA[i], 10);
      if (diff) {
        return diff;
      }
    }
    return segmentsB.length - segmentsA.length;
  }
}
