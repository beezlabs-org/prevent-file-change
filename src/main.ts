import {debug, getInput, info, setFailed} from '@actions/core'
import {context} from '@actions/github'
import {isTrustedAuthor} from './author-checker'
import {GitHubService, IFile} from './github-services'
import {checkChangedFilesAgainstPattern} from './pattern-matcher'

async function run(): Promise<void> {
  try {
    const trustedAuthors = getInput('trusted-authors')
    const pattern = getInput('pattern', {required: true})
    const githubToken = getInput('token', {required: true})

    debug('Inputs received')

    const pullRequestAuthor = context.actor
    const eventName = context.eventName

    debug(`Event='${eventName}', Author='${pullRequestAuthor}', Trusted Authors='${trustedAuthors}'`)

    if (await isTrustedAuthor(pullRequestAuthor, trustedAuthors)) {
      info(`${pullRequestAuthor} is a trusted author and is allowed to modify any matching files.`)
    } else if (eventName === 'pull_request') {
      const gitHubService = new GitHubService(githubToken)
      const pullRequestNumber = context.payload?.pull_request?.number || 0
      if (pullRequestNumber) {
        const files: IFile[] = await gitHubService.getChangedFiles(
          context.repo.owner,
          context.repo.repo,
          pullRequestNumber
        )
        await checkChangedFilesAgainstPattern(files, pattern)
      } else {
        setFailed('Pull request number is missing in github event payload')
      }
    } else {
      setFailed(`Only pull_request events are supported. Event was: ${eventName}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    } else {
      setFailed('Unknown error occurred')
    }
  }
}

run()
