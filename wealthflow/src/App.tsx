import React, { useCallback, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow'
import type { Node, Edge, Connection } from 'reactflow'
import 'reactflow/dist/style.css'
import './index.css'
import { v4 as uuid } from 'uuid'


const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  const nodeClasses =
    'p-2 mb-2 bg-white text-black rounded-md shadow-card cursor-grab'
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
  node: Node | null
  update: (node: Node) => void
}) => {
  if (!node) return <div className="p-4">Select a node</div>
  return (
    <div className="p-4 space-y-2" data-testid="drawer">
      <label className="block text-sm">
        <span className="font-serif">Label</span>
        <input
          className="mt-1 w-full rounded-md p-1 text-black"
          value={node.data.label}
          onChange={(e) => update({ ...node, data: { label: e.target.value } })}
        />
      </label>
    </div>
  )
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [selected, setSelected] = useState<Node | null>(null)
  const { screenToFlowPosition, addNodes } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const newNode: Node = {
        id: uuid(),
        type: 'default',
        position,
        data: { label: type },
      }
      addNodes(newNode)
    },
    [screenToFlowPosition, addNodes]
  )

  const onSaveRun = async () => {
    const res = await fetch('http://localhost:3001/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    })
    const data = await res.json()
    alert(`Workflow started: ${data.workflowId}`)
  }

  return (
    <div className="flex h-screen" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <Sidebar />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelected(node)}
        >
          <Background />
          <Controls />
        </ReactFlow>
        <div className="p-2 text-right">
          <button
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white"
            onClick={onSaveRun}
          >
            Save &amp; Run
          </button>
        </div>
      </div>
      <div className="w-64 bg-gray-800" >
        <NodeSettings node={selected} update={(n) => setNodes((nds) => nds.map((nn) => (nn.id === n.id ? n : nn)))} />
      </div>
    </div>
  )
}
