import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    // Get the 'run' input
    const runCommand = core.getMultilineInput('run').join('\n')

    // Execute the commands
    const options: exec.ExecOptions = {
      listeners: {
        stdout: (data: Buffer) => {
          console.log(data.toString())
        },
        stderr: (data: Buffer) => {
          console.error(data.toString())
        }
      }
    }

    await exec.exec('bash', ['-c', runCommand], options)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
