import {debug} from '@actions/core'
import {IFile} from './github-services'

export function checkChangedFilesAgainstPattern(files: IFile[], pattern: string): void {
  if (!files || files?.length === 0) {
    debug(`This commit doesn't contain any files`)
    return
  }
  const regExp = new RegExp(pattern)
  if (files.some(file => regExp.test(file.filename))) {
    throw new Error(`There is at least one file matching the pattern ${pattern}`)
  }
  debug(`There isn't any file matching the pattern ${pattern}`)
}
