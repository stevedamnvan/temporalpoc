import express from 'express'
import cors from 'cors'
import { Connection, Client } from '@temporalio/client'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/workflows', async (req, res) => {
  try {
    const graph = req.body
    const connection = await Connection.connect()
    const client = new Client({ connection })
    const handle = await client.workflow.start('runGraphWorkflow', {
      args: [graph],
      taskQueue: 'wealthflow',
      workflowId: `wealthflow-${Date.now()}`,
    })
    res.json({ workflowId: handle.workflowId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to start workflow' })
  }
})

app.listen(3001, () => console.log('Server listening on http://localhost:3001'))
