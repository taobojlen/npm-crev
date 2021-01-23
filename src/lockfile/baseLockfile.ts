import { Dependency } from "../types";

abstract class BaseLockfile {
  /**
   * Checks whether the given lockfile is actually an instance of the current class.
   */
  abstract check(): Promise<boolean>;

  /**
   * Returns a list of dependencies from the lockfile.
   */
  abstract getDependencies(): Promise<Dependency[]>;
}

export default BaseLockfile;
