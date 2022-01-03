import { Connection, WorkflowClient } from "@temporalio/client";
import { ScheduleWorkflow, example } from "./workflows";

async function run() {
  const connection = new Connection(); // Connect to localhost with default ConnectionOptions.
  // In production, pass options to the Connection constructor to configure TLS and other settings.
  // This is optional but we leave this here to remind you there is a gRPC connection being established.

  const client = new WorkflowClient(connection.service, {
    // In production you will likely specify `namespace` here; it is 'default' if omitted
  });

  // Invoke the `example` Workflow, only resolved when the workflow completes
  const handle = await client.start(ScheduleWorkflow, {
    args: [
      example,
      {
        args: ["John Doe"],
      },
      {
        cronParser: {
          expression: "* * * * *",
        },
      },
    ],
    taskQueue: "tutorial",
    workflowId: "my-business-id",
  });
  console.log(`Started workflow ${handle.workflowId}`);
  // optional: wait for client result
  // console.log(await handle.result()); // Hello, Temporal!
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
