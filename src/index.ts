import * as core from '@actions/core'
import * as exec from '@actions/exec'

import { CloudWatchLogger } from './cwl_logger'

async function run(): Promise<void> {
  try {
    const runCommand = core.getMultilineInput('run').join('\n')
    const region = core.getInput("region") || process.env.AWS_REGION || "us-east-1";
    const loggroup = core.getInput("loggroup") || process.env.LOG_GROUP || "gha-custom-action-ts-sample"
    const logstream = core.getInput("logstream") || process.env.LOG_STREAM || new Date().toISOString().split('T')[0];

    const logger = new CloudWatchLogger(region, loggroup, logstream)
    await logger.initialize()
 
    const options: exec.ExecOptions = {
      listeners: {
        stdout: (data: Buffer) => {
          logger.sendLog(data.toString())
        },
        stderr: (data: Buffer) => {
          logger.sendLog(data.toString())
        }
      }
    }

    await exec.exec('bash', ['-c', runCommand], options)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
