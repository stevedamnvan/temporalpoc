import React, { useCallback, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow'
import type { Node, Connection } from 'reactflow'
import 'reactflow/dist/style.css'
import './index.css'
import { v4 as uuid } from 'uuid'

type WFData = { title: string }

const WorkflowNode = ({ data }: { data: WFData }) => (
  <div className="w-[460px] rounded-md bg-surface p-[20px_24px] flex space-x-3">
    <div className="h-10 w-10 rounded-md bg-surface-alt" />
    <div className="space-y-1">
      <div className="text-base font-semibold text-text-primary">{data.title}</div>
      <div className="text-sm text-text-accent">{data.title} details</div>
      <div className="text-sm text-[#c6dedb]">Body text</div>
    </div>
  </div>
)

const nodeTypes = { workflow: WorkflowNode }

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  const nodeClasses =
    'p-2 mb-2 bg-surface text-text-primary rounded-md shadow-card cursor-grab'
  return (
    <aside className="w-40 p-4" data-testid="sidebar">
      {['Trigger', 'Action', 'Condition', 'Wait'].map((t) => (
        <div
          key={t}
          className={nodeClasses}
          onDragStart={(e) => onDragStart(e, t.toLowerCase())}
          draggable
        >
          {t}
        </div>
      ))}
    </aside>
  )
}

const NodeSettings = ({
  node,
  update,
}: {
  node: Node<WFData> | null
  update: (node: Node<WFData>) => void
}) => {
  if (!node) return <div className="p-4">Select a node</div>
  return (
    <div className="p-4 space-y-2" data-testid="drawer">
      <label className="block text-sm">
        <span className="font-serif">Label</span>
        <input
          className="mt-1 w-full rounded-md p-1 text-black"
          value={node.data.title}
          onChange={(e) => update({ ...node, data: { title: e.target.value } })}
        />
      </label>
    </div>
  )
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WFData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selected, setSelected] = useState<Node<WFData> | null>(null)
  const { addNodes, toObject } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return
      const y = nodes.length * 124
      const newNode: Node<WFData> = {
        id: uuid(),
        type: 'workflow',
        position: { x: 0, y },
        data: { title: type },
      }
      addNodes(newNode)
    },
    [nodes.length, addNodes]
  )

  const onSaveRun = async () => {
    const res = await fetch('http://localhost:3001/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toObject()),
    })
    const data = await res.json()
    alert(`Workflow started: ${data.workflowId}`)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex">
      <Sidebar />
      <div className="flex-1 relative" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <Panel position="top-left" className="p-4 font-semibold">A WORKFLOWS</Panel>
        <h1 className="ml-4 mt-12 font-serif text-[32px] font-semibold text-[#e5f7f5]">Raise cash for billing accounts</h1>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelected(node)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: 'straight', style: { stroke: '#054c46', strokeWidth: 2 } }}
        >
          <Background />
          <Controls />
        </ReactFlow>
        <div className="p-2 text-right">
          <button
            className="mt-2 rounded-md bg-text-accent px-4 py-2 text-bg"
            onClick={onSaveRun}
          >
            Save &amp; Run
          </button>
        </div>
      </div>
      <div className="w-64 bg-surface" >
        <NodeSettings
          node={selected}
          update={(n) =>
            setNodes((nds) => nds.map((nn) => (nn.id === n.id ? n : nn)))
          }
        />
      </div>
    </div>
  )
}
