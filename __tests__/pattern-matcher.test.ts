import * as core from '@actions/core'
import {IFile} from '../src/github-services'
import {PatternMatcher} from '../src/pattern-matcher'
import {
  expect,
  test,
  beforeEach,
  afterEach,
  describe,
  jest
} from '@jest/globals'

let patternMatcher: PatternMatcher
const coreDebugSpy = jest.fn(() => {})
const coreSetFailedSpy = jest.fn(() => {})

describe('pattern-matcher', () => {
  beforeEach(() => {
    jest.spyOn(core, 'debug').mockImplementation(coreDebugSpy)
    jest.spyOn(core, 'setFailed').mockImplementation(coreSetFailedSpy)
    patternMatcher = new PatternMatcher()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('if matching pattern is rejected', async () => {
    const files: IFile[] = givenFiles()
    const pattern: string = '.*.js'

    await patternMatcher.checkChangedFilesAgainstPattern(files, pattern)

    expect(coreSetFailedSpy).toHaveBeenCalledTimes(1)
    expect(coreDebugSpy).toHaveBeenCalledTimes(0)
  })

  test('if non matching pattern is not rejected', async () => {
    const files: IFile[] = givenFiles()
    const pattern: string = '.*.ts'

    await patternMatcher.checkChangedFilesAgainstPattern(files, pattern)

    expect(coreSetFailedSpy).toHaveBeenCalledTimes(0)
    expect(coreDebugSpy).toHaveBeenCalledTimes(1)
  })

  test('if empty commit is not rejected', async () => {
    const files: IFile[] = []
    const pattern: string = '.*'

    await patternMatcher.checkChangedFilesAgainstPattern(files, pattern)

    expect(coreSetFailedSpy).toHaveBeenCalledTimes(0)
    expect(coreDebugSpy).toHaveBeenCalledTimes(1)
  })
})

function givenFiles(): IFile[] {
  return [{filename: 'src/file1.js'}, {filename: 'README.md'}]
}
