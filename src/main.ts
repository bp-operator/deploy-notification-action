import * as core from '@actions/core'
import {getMilestoneIssues, getDriver} from './github'
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
    const environment: string = core.getInput('environment', {
      required: false
    })
    const completionNotification: boolean = core.getBooleanInput(
      'completion-notification',
      {
        required: true
      }
    )

    core.debug(`Deploy Notification To Slack version: ${version}`)

    const milestoneIssues = await getMilestoneIssues(version)
    const driver = getDriver()
    await sendToSlack(
      driver,
      milestoneIssues,
      version,
      slackReceiverUser,
      slackReceiverTeam,
      completionNotification,
      environment
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
run()
