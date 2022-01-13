import * as wf from '@temporalio/workflow';

const noop = async () => {}
type Update = any // no way to export this usefully?
type ThingToInvoke = { activity: string, activityOptions: wf.ActivityOptions } 
| { workflow: string, workflowOptions: wf.ChildWorkflowOptions }
export const EntityUpdateSignal = wf.defineSignal<[Update]>('EntityUpdateSignal') // no real way to pass the types
export class Entity<Input = any> {
  MAX_ITERATIONS: number
  setup: (input: Input) => Promise<void>
  cleanup: () => Promise<void>
  thingToInvoke: ThingToInvoke

  constructor(thingToInvoke: ThingToInvoke, maxIterations = 1000, setup = noop, cleanup = noop) {
    this.thingToInvoke = thingToInvoke;
    this.MAX_ITERATIONS = maxIterations // can override if needed
    this.setup = setup
    this.cleanup = cleanup
    this.workflow = this.workflow.bind(this)
  }

  async workflow(input: Input, isContinued = false) {
    try {
      const pendingUpdates = Array<Update>();
      wf.setHandler(EntityUpdateSignal, (updateCommand: Input) => {
        pendingUpdates.push(updateCommand);
      });

      if (!isContinued) {
        await this.setup(input);
      }

      for (let iteration = 1; iteration <= this.MAX_ITERATIONS; ++iteration) {
          // Automatically continue as new after a day if no updates were received
          await wf.condition(() => pendingUpdates.length > 0, '1 day');
      
          while (pendingUpdates.length) {
            const update = pendingUpdates.shift();
            if ('activity' in this.thingToInvoke) {
              const acts = wf.proxyActivities(this.thingToInvoke.activityOptions);
              await acts[this.thingToInvoke.activity](update);
            } else if ('workflow' in this.thingToInvoke) {
              wf.executeChild(this.thingToInvoke.workflow, {
                args: update
                ...this.thingToInvoke.workflowOptions
              });
            } else {
              throw new Error('No thing to invoke: ' + JSON.stringify(this.thingToInvoke))
            }
          }
      }
    } catch (err) {
      if (wf.isCancellation(err)) {
        await wf.CancellationScope.nonCancellable(async () => {
          await this.cleanup();
        });
      }
      throw err;
    }
    await wf.continueAsNew<typeof this.workflow>(input, false);
  }
}