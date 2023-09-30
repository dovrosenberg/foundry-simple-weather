import { Foundry } from '@/libraries/foundry/foundry';
import { ModuleSettings } from '@/settings/module-settings';
import { VersionUtils } from '@/utils/versionUtils';

export class Notices {
  constructor(private gameRef: Game, private moduleSettings: ModuleSettings) {}

  public async checkForNotices() {
    if (this.noticeForCurrentVersionIsDeclared() && !this.noticeForCurrentVersionWasRead() && await this.noticeFileExistsForCurrentVersion() ) {
      this.spawnNotice(this.moduleSettings.getVersion());
    } else if (await this.previousNoticeExists() && !this.noticeForPreviousVersionWasRead() && !this.noticeForCurrentVersionWasRead()) {
      this.spawnNotice(this.getPreviousVersion());
    }
  }

  private noticeFileExistsForCurrentVersion(): boolean {
    return this.noticeFileExists(this.moduleSettings.getVersion());
  }

  private noticeForCurrentVersionWasRead(): boolean {
    return this.moduleSettings.getListOfReadNoticesVersions().includes(this.moduleSettings.getVersion());
  }

  private noticeForCurrentVersionIsDeclared(): boolean {
    return this.moduleSettings.getVersionsWithNotices().includes(this.moduleSettings.getVersion());
  }

  private previousNoticeExists(): boolean {
    return !!this.getPreviousVersion() && this.noticeFileExists(this.getPreviousVersion());
  }

  private noticeForPreviousVersionWasRead() {
    return this.moduleSettings.getListOfReadNoticesVersions().includes(this.getPreviousVersion());
  }

  private getPreviousVersion(): string {
    const semvers = VersionUtils.sortSemver(this.moduleSettings.getVersionsWithNotices());
    return semvers.filter(item => item !== this.moduleSettings.getVersion())[0];
  }

  private spawnNotice(version: string) {
    const templatePath = this.getPathOfNotice(version);
    Foundry.renderTemplate(templatePath).then((html: string) => {
      new Dialog({
        title: 'Weather Control Update',
        content: html,
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: this.gameRef.i18n.localize('sweath.notice.Acknowledge'),
            callback: () => this.markNoticeAsSeen()
          }
        },
        default: 'yes',
      }, { width: 600, height: 700, classes: ['wctrlDialog'] }).render(true);
    });
  }

  private markNoticeAsSeen() {
    this.moduleSettings.addVersionToReadNotices(this.moduleSettings.getVersion());
  }

  private noticeFileExists(version: string): boolean {
    try {
      return Foundry.srcExists(`modules/${this.moduleSettings.getModuleName()}/templates/notices/${version}.html`);
    } catch {
      return false;
    }
  }

  private getPathOfNotice(version: string): string {
    return `modules/${this.moduleSettings.getModuleName()}/templates/notices/${version}.html`;
  }
}
