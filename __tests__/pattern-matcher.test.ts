import * as core from '@actions/core'
import {IFile} from '../src/github-services'
import {checkChangedFilesAgainstPattern} from '../src/pattern-matcher'
import {expect, test, beforeEach, afterEach, describe, jest} from '@jest/globals'

const coreDebugSpy = jest.fn(() => {})

describe('pattern-matcher', () => {
  beforeEach(() => {
    jest.spyOn(core, 'debug').mockImplementation(coreDebugSpy)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('if matching pattern is rejected', async () => {
    const files: IFile[] = givenFiles()
    const pattern = '.*.js'

    expect(() => checkChangedFilesAgainstPattern(files, pattern)).toThrowError(
      new Error(`There is at least one file matching the pattern ${pattern}`)
    )
  })

  test('if non matching pattern is not rejected', async () => {
    const files: IFile[] = givenFiles()
    const pattern = '.*.ts'

    checkChangedFilesAgainstPattern(files, pattern)

    expect(coreDebugSpy).toHaveBeenCalledTimes(1)
  })

  test('if empty commit is not rejected', async () => {
    const files: IFile[] = []
    const pattern = '.*'

    checkChangedFilesAgainstPattern(files, pattern)

    expect(coreDebugSpy).toHaveBeenCalledTimes(1)
  })
})

function givenFiles(): IFile[] {
  return [{filename: 'src/file1.js'}, {filename: 'README.md'}]
}
