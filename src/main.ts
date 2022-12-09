import * as core from '@actions/core'
import {getMilestoneIssues} from './github'
import {sendToSlack} from './slack'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version', {required: true})
    const slackReceiverUser: string = core.getInput('slack-receiver-user', {
      required: false
    })
    const slackReceiverTeam: string = core.getInput('slack-receiver-group', {
      required: false
    })

    core.debug(`Deploy Notification To Slack version: ${version}`)

    const milestoneIssues = await getMilestoneIssues(version)
    await sendToSlack(
      milestoneIssues,
      version,
      slackReceiverUser,
      slackReceiverTeam
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
run()
