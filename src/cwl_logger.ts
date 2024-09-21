import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand
} from '@aws-sdk/client-cloudwatch-logs'

export class CloudWatchLogger {
  private client: CloudWatchLogsClient
  private logGroupName: string
  private logStreamName: string
  private logGroupExists: boolean = false
  private logStreamExists: boolean = false

  constructor(region: string, logGroupName: string, logStreamName: string) {
    this.client = new CloudWatchLogsClient({ region })
    this.logGroupName = logGroupName
    this.logStreamName = logStreamName 
  }

  async initialize(): Promise<void> {
    await this.ensureLogGroupExists()
    await this.ensureLogStreamExists()
  }

  private async ensureLogGroupExists(): Promise<void> {
    try {
      const command = new DescribeLogGroupsCommand({
        logGroupNamePrefix: this.logGroupName
      })
      const response = await this.client.send(command)

      if (
        !response.logGroups?.some(
          group => group.logGroupName === this.logGroupName
        )
      ) {
        await this.createLogGroup()
      }
      this.logGroupExists = true
    } catch (error) {
      console.error('Error checking log group:', error)
      throw error
    }
  }

  private async createLogGroup(): Promise<void> {
    try {
      const command = new CreateLogGroupCommand({
        logGroupName: this.logGroupName
      })
      await this.client.send(command)
      console.log(`Log group '${this.logGroupName}' created successfully.`)
    } catch (error) {
      console.error('Error creating log group:', error)
      throw error
    }
  }

  private async ensureLogStreamExists(): Promise<void> {
    try {
      const command = new DescribeLogStreamsCommand({
        logGroupName: this.logGroupName,
        logStreamNamePrefix: this.logStreamName
      })
      const response = await this.client.send(command)

      if (
        !response.logStreams?.some(
          stream => stream.logStreamName === this.logStreamName
        )
      ) {
        await this.createLogStream()
      }
      this.logStreamExists = true
    } catch (error) {
      console.error('Error checking log stream:', error)
      throw error
    }
  }

  private async createLogStream(): Promise<void> {
    try {
      const command = new CreateLogStreamCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName
      })
      await this.client.send(command)
      console.log(`Log stream '${this.logStreamName}' created successfully.`)
    } catch (error) {
      console.error('Error creating log stream:', error)
      throw error
    }
  }

  async sendLog(message: string): Promise<void> {
    if (!this.logGroupExists || !this.logStreamExists) {
      throw new Error('Logger not initialized. Call initialize() first.')
    }

    try {
      const command = new PutLogEventsCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [
          {
            message,
            timestamp: Date.now()
          }
        ]
      })
      await this.client.send(command)
      console.log('Log sent successfully.')
    } catch (error) {
      console.error('Error sending log:', error)
      throw error
    }
  }
}
