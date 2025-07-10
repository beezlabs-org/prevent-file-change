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

    if (eventName !== 'pull_request') {
      setFailed(`Only pull_request events are supported. Event was: ${eventName}`)
      return
    }

    if (isTrustedAuthor(pullRequestAuthor, trustedAuthors)) {
      info(`${pullRequestAuthor} is a trusted author and is allowed to modify any matching files.`)
      return
    }

    const gitHubService = new GitHubService(githubToken)
    const pullRequestNumber = context.payload?.pull_request?.number || 0
    if (!pullRequestNumber) {
      setFailed('Pull request number is missing in github event payload')
      return
    }
    const files: IFile[] = await gitHubService.getChangedFiles(context.repo.owner, context.repo.repo, pullRequestNumber)
    checkChangedFilesAgainstPattern(files, pattern)
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    } else {
      setFailed('Unknown error occurred')
    }
  }
}

run()
