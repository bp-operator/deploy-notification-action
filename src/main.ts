import * as core from '@actions/core'
import {getMilestoneIssues} from './github'
import {sendToSlack} from './slack'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version', {required: true})

    core.debug(`Deploy Notification To Slack version: ${version}`)

    const milestoneIssues = await getMilestoneIssues(version)
    await sendToSlack(milestoneIssues, version)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
run()
