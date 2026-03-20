import { useMemo, useEffect, useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DOMAIN_ICONS = {
  "Python": "🐍", "Data": "📊", "ML": "🤖", "Cloud": "☁️", 
  "PM": "📋", "Comms": "💬", "Leadership": "👔", "Ops": "🏭", 
  "Safety": "🦺", "Operations": "🏭", "Architecture": "🏛️",
  "DevOps": "♾️", "Frontend": "⚛️", "Backend": "⚙️", "Analytics": "📈"
};

const PRIORITY_COLORS = {
  "critical": { border: "#EF4444", bg: "#EF4444/10" },
  "recommended": { border: "#F59E0B", bg: "#F59E0B/10" },
  "optional": { border: "#10B981", bg: "#10B981/10" }
};

// Custom Node Component
const CourseNode = ({ data }) => {
  const icon = DOMAIN_ICONS[data.domain] || "📚";
  const colors = PRIORITY_COLORS[data.priority] || PRIORITY_COLORS.optional;
  
  return (
    <div 
      className="bg-[#1E293B] rounded-xl p-4 w-64 shadow-xl transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] group cursor-pointer"
      style={{ border: `2px solid ${colors.border}` }}
      onClick={() => data.onClick(data)}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#94A3B8] !w-3 !h-3" />
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold border ${data.priority === 'critical' ? 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10' : data.priority === 'recommended' ? 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10' : 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10'}`}>
          {data.priority}
        </span>
      </div>
      
      <h4 className="text-lg font-bold font-['Outfit'] text-[#F1F5F9] mb-3 leading-tight group-hover:text-[#06B6D4] transition-colors">
        {data.title}
      </h4>
      
      <div className="flex justify-between items-center text-xs font-medium text-[#94A3B8] border-t border-[#334155] pt-3">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{data.duration_hours} hrs</span>
        <span className="uppercase px-2 py-0.5 bg-[#0F172A] rounded-md border border-[#334155]">{data.level}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#06B6D4] !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = { custom: CourseNode };

export const PathwayGraph = () => {
  const { pathway } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
  }, []);

  useEffect(() => {
    if (!pathway || pathway.length === 0) return;

    // Generate nodes
    const initialNodes = pathway.map((course, idx) => ({
      id: course.course_id,
      type: 'custom',
      data: { 
        ...course, 
        onClick: (data) => setSelectedNode(data) // Handled natively or safely via custom node
      },
      position: { x: 0, y: 0 }
    }));

    // Generate sequential edges based on position sorting
    const sorted = [...pathway].sort((a,b) => a.position - b.position);
    const initialEdges = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      initialEdges.push({
        id: `e-${sorted[i].course_id}-${sorted[i+1].course_id}`,
        source: sorted[i].course_id,
        target: sorted[i+1].course_id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#06B6D4', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06B6D4' }
      });
    }

    // Dagre Layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50 });

    initialNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 256, height: 160 });
    });
    initialEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = initialNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 128, // center offset (width/2)
          y: nodeWithPosition.y - 80,  // center offset (height/2)
        },
      };
    });

    setNodes(layoutedNodes);
    setEdges(initialEdges);
  }, [pathway, setNodes, setEdges]);

  if (!pathway || pathway.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">No pathway generated yet.</div>;
  }

  return (
    <div className="w-full h-[600px] bg-[#0F172A] rounded-2xl border border-[#334155] overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        className="bg-grid"
      >
        <Background gap={40} size={1} color="#334155" />
        <Controls className="!bg-[#1E293B] !border-[#334155] !fill-[#F1F5F9] [&>button]:!border-b-[#334155] hover:[&>button]:!bg-[#334155]" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data.priority === 'critical') return '#EF4444';
            if (n.data.priority === 'recommended') return '#F59E0B';
            return '#10B981';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-[#1E293B] !border-[#334155] rounded-xl overflow-hidden" 
        />
      </ReactFlow>
      
      {selectedNode && (
        <div
          className="absolute inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-2xl">{selectedNode.icon || '📚'}</span>
                <h3 className="text-[#F1F5F9] font-heading font-bold text-lg mt-1">
                  {selectedNode.title}
                </h3>
                <p className="text-[#94A3B8] text-sm">{selectedNode.domain}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#94A3B8] hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-2 py-1 bg-[#0F172A] rounded text-xs text-[#06B6D4]">
                {selectedNode.level}
              </span>
              <span className="px-2 py-1 bg-[#0F172A] rounded text-xs text-[#94A3B8]">
                ⏱ {selectedNode.duration_hours} hrs
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                selectedNode.priority === 'critical' ? 'bg-red-900/40 text-red-400' :
                selectedNode.priority === 'recommended' ? 'bg-amber-900/40 text-amber-400' :
                'bg-green-900/40 text-green-400'
              }`}>
                {selectedNode.priority}
              </span>
            </div>

            {/* Skills Taught */}
            {selectedNode.skills_taught && (
              <div className="mb-4">
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-2">Skills Taught</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.skills_taught.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#0F172A] rounded text-xs text-[#F1F5F9]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {selectedNode.learning_objectives && selectedNode.learning_objectives.length > 0 && (
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-2">Learning Objectives</p>
                <ul className="space-y-1">
                  {selectedNode.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#F1F5F9]">
                      <span className="text-[#10B981] flex-shrink-0">✓</span> {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[#64748B] text-xs mt-4 text-center">Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
