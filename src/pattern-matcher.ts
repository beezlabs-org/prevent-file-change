import * as core from '@actions/core'
import {IFile} from './github-services'

export class PatternMatcher {
  async checkChangedFilesAgainstPattern(
    files: IFile[],
    pattern: string
  ): Promise<void> {
    if (files?.length > 0) {
      const regExp = new RegExp(pattern)
      files.some(file => regExp.test(file.filename))
        ? await PatternMatcher.setFailed(pattern)
        : core.debug(`There isn't any file matching the pattern ${pattern}`)
    } else core.debug(`This commit doesn't contain any files`)
  }

  private static async setFailed(pattern: string): Promise<void> {
    core.setFailed(`There is at least one file matching the pattern ${pattern}`)
    return
  }
}
