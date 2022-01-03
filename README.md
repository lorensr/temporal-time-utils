# temporal-time-utils

This is a library with some reusable functions for [Temporal.io TypeScript SDK](https://docs.temporal.io/docs/typescript/introduction):

- `sleepUntil`
- `UpdatableTimer`
- `ScheduleWorkflow`

This serves as both a utility library and a demonstration of how you can publish reusable Temporal libraries (both for Workflows and Activities).

```ts
npm i temporal-time-utils
```

Repo: https://github.com/sw-yx/temporal-time-utils

## `sleepUntil`

This is a simple drop in replacement for Temporal's `workflow.sleep()` API for when you need to sleep to a specific date rather than a fixed number of milliseconds.

```ts
import { sleepUntil } from 'temporal-time-utils'

// inside workflow function
sleepUntil('30 Sep ' + (new Date().getFullYear() + 1)); // wake up when September ends
sleepUntil('5 Nov 2022 00:12:34 GMT'); // wake up at specific time and timezone

// optional 2nd arg
sleepUntil('5 Nov 2022 00:12:34 GMT', specificDateTime); // take control over the "start" time in case you need to
```

This is a very simple function - under the hood it just uses `date-fns/differenceInMilliseconds` to calculate time difference.

This is discussed in the docs https://docs.temporal.io/docs/typescript/workflows#sleep

## `UpdatableTimer`

`sleep` only lets you set a fixed time upfront. 
`UpdatableTimer` is a special class that lets you update that while sleeping.
You can consider it the next step up from `sleepUntil`.

After you instantiate it with an initial datetime to wake up at, it exposes only two APIs: `then()` for you to `await`, and `.deadline` that you can set and get.

```ts
// example usage inside workflow function
export async function countdownWorkflow(): Promise<void> {
  const target = Date.now() + 24 * 60 * 60 * 1000; // 1 day!!!
  const timer = new UpdatableTimer(target);
  console.log('timer set for: ' + new Date(target).toString());
  wf.setHandler(setDeadlineSignal, (deadline) => {
    // send in new deadlines via Signal
    timer.deadline = deadline;
    console.log('timer now set for: ' + new Date(deadline).toString());
  });
  wf.setHandler(timeLeftQuery, () => timer.deadline - Date.now());
  await timer; // if you send in a signal with a new time, this timer will resolve earlier!
  console.log('countdown done!');
}
```

This is discussed in the docs https://docs.temporal.io/docs/typescript/workflows#async-design-patterns.

## `ScheduleWorkflow`

A Workflow that schedules other Workflows.

This is a premade Workflow that you can register in a Worker and call from a client, to invoke other Workflows on a schedule. You can consider this the next step up from "Cron Workflows".

```ts
// inside client file
async function run() {
  const client = new WorkflowClient();
  const handle = await client.start(ScheduleWorkflow, {
    args: [
      exampleWorkflow,
      {
        args: ["Example arg payload"], // static for now, but possible to modify to make dynamic in future - ask swyx
        // // regular workflow options apply here, with two additions (defaults shown):
        // cancellationType: ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        // parentClosePolicy: ParentClosePolicy.PARENT_CLOSE_POLICY_TERMINATE
      },
      { // args 
        cronParser: {
          expression: "* * * * *", // every minute
          // options: https://www.npmjs.com/package/cron-parser#user-content-options
        },
        // maxInvocations?: number; 
        // jitterMs?: number;
      },
    ],
    taskQueue: "tutorial",
    workflowId: "my-schedule-id",
  });
}
```

This uses https://www.npmjs.com/package/cron-parser under the hood, thereby getting support for things like timezones and "last of the week" extensions to the cron syntax:

```ts
// client.ts
const handle = await client.start(MyScheduleWorkflow, {
  args: [
    {
      cronParser: {
        expression: '0 0 * * * 1,3L', // run every Monday as well as the last Wednesday of the month
        options: {
          currentDate: '2016-03-27 00:00:01',
          endDate: new Date('Wed, 26 Dec 2012 14:40:00 UTC'),
          tz: 'Europe/Athens',
        },
      },
      maxInvocations: 500,
      jitterMs: 1000,
    },
  ],
  taskQueue: 'scheduler',
  workflowId: 'schedule-for-' + userId,
});
```

This is a decoupled and slightly modified variant of what was discussed in the docs: https://docs.temporal.io/docs/typescript/workflows#schedule-workflow-example

## Monorepo details

This project is bootstrapped with Turborepo.

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
npm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
npm run dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching (Beta) you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/features/pipelines)
- [Caching](https://turborepo.org/docs/features/caching)
- [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/features/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
