import {debug, setFailed} from '@actions/core'
import {IFile} from './github-services'

export async function checkChangedFilesAgainstPattern(files: IFile[], pattern: string): Promise<void> {
  if (files?.length > 0) {
    const regExp = new RegExp(pattern)
    files.some(file => regExp.test(file.filename))
      ? await setPatternFailed(pattern)
      : debug(`There isn't any file matching the pattern ${pattern}`)
  } else debug(`This commit doesn't contain any files`)
}

async function setPatternFailed(pattern: string): Promise<void> {
  setFailed(`There is at least one file matching the pattern ${pattern}`)
  return
}
