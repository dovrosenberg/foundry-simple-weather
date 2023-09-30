
export abstract class Migration {
  public readonly version: number;

  protected constructor(version: number) {
    this.version = version;
  }

  public abstract migrate(previous: unknown): unknown;
}
