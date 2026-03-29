import { useRef, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force'
import { Delaunay } from 'd3-delaunay'

export default function WisdomMap({ topics, onSelect, selectedPoint, highlightedTopics = [] }) {
    const containerRef = useRef(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [nodes, setNodes] = useState([])
    const [nearestTopic, setNearestTopic] = useState(null)

    // Initialize dimensions
    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            })
        }
    }, [])

    // Initialize and Run Simulation for Layout
    useEffect(() => {
        if (!dimensions.width) return

        const initialNodes = Object.entries(topics).map(([name, coords]) => {
            const pixelPos = toPixels(coords.x, coords.y, dimensions)
            const approxRadius = (name.length * 4) + 15

            return {
                id: name,
                origX: coords.x,
                origY: coords.y,
                targetX: pixelPos.left,
                targetY: pixelPos.top,
                x: pixelPos.left,
                y: pixelPos.top,
                r: approxRadius
            }
        })

        const simulation = forceSimulation(initialNodes)
            .force('x', forceX(d => d.targetX).strength(0.08))
            .force('y', forceY(d => d.targetY).strength(0.08))
            .force('collide', forceCollide(d => d.r).strength(1).iterations(3))
            .stop()

        for (let i = 0; i < 300; ++i) simulation.tick()

        setNodes(initialNodes)

    }, [topics, dimensions])

    // Voronoi calculation
    const voronoiData = useMemo(() => {
        if (!dimensions.width || nodes.length < 3) return null

        const points = nodes.map(n => [n.x, n.y])
        const delaunay = Delaunay.from(points)
        const voronoi = delaunay.voronoi([0, 0, dimensions.width, dimensions.height])

        return nodes.map((node, i) => ({
            id: node.id,
            path: voronoi.renderCell(i),
            centerX: node.x,
            centerY: node.y
        }))
    }, [nodes, dimensions])

    // Helper: Find Nearest Topic to Selected Point
    useEffect(() => {
        if (selectedPoint && nodes.length > 0) {
            let closest = null
            let minDist = Infinity

            nodes.forEach(node => {
                const dist = Math.hypot(node.origX - selectedPoint.x, node.origY - selectedPoint.y)
                if (dist < minDist) {
                    minDist = dist
                    closest = node
                }
            })
            setNearestTopic(closest)
        } else if (highlightedTopics.length === 0) {
            setNearestTopic(null)
        }
    }, [selectedPoint, nodes, highlightedTopics])


    const handleClick = (e) => {
        const rect = containerRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        const x = (clickX / rect.width) * 2 - 1
        const y = -((clickY / rect.height) * 2 - 1)

        onSelect({ x, y })
    }

    const toPixels = (cx, cy, dims) => {
        if (!dims.width) return { left: 0, top: 0 }
        const left = ((cx + 1) / 2) * dims.width
        const top = ((-cy + 1) / 2) * dims.height
        return { left, top }
    }

    const selectionPixel = selectedPoint
        ? toPixels(selectedPoint.x, selectedPoint.y, dimensions)
        : null

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: 'crosshair',
                background: '#0a0b0e',
                overflow: 'hidden'
            }}
        >
            {/* Background Grid & Quad Labels */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5, background: '#444', zIndex: 1 }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5, background: '#444', zIndex: 1 }} />

            <Label text="ACTION" top={25} left="50%" align="center" />
            <Label text="ACCEPTANCE" bottom={25} left="50%" align="center" />
            <Label text="SELF" top="50%" left={30} align="left" vertical />
            <Label text="WORLD" top="50%" right={30} align="right" vertical />

            {/* Voronoi Paths Layer */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <radialGradient id="selectedGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <AnimatePresence>
                    {voronoiData && voronoiData.map((cell) => {
                        const isSingleMatch = nearestTopic && nearestTopic.id === cell.id
                        const isMultiMatch = highlightedTopics.includes(cell.id)
                        const isActive = isSingleMatch || isMultiMatch

                        return (
                            <motion.path
                                key={`cell-${cell.id}`}
                                d={cell.path}
                                initial={false}
                                animate={{
                                    fill: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                                    stroke: isActive ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255, 255, 255, 0.02)',
                                }}
                                transition={{ duration: 0.4 }}
                                style={{ pointerEvents: 'none' }}
                            />
                        )
                    })}
                </AnimatePresence>
            </svg>

            {/* Nodes & Labels */}
            {nodes.map((node) => {
                const isSingleMatch = nearestTopic && nearestTopic.id === node.id
                const isMultiMatch = highlightedTopics.includes(node.id)
                const isHighlighted = isSingleMatch || isMultiMatch

                return (
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0 }}
                        animate={{
                            left: node.x,
                            top: node.y,
                            opacity: isHighlighted ? 1 : 0.35,
                            scale: isHighlighted ? 1.15 : 1,
                            color: isHighlighted ? 'var(--gold)' : 'var(--text-secondary)'
                        }}
                        whileHover={{ opacity: 1, scale: 1.05, zIndex: 10, cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelect({ x: node.origX, y: node.origY })
                            setNearestTopic(node)
                        }}
                        style={{
                            position: 'absolute',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '0.7rem',
                            fontWeight: isHighlighted ? '600' : '400',
                            pointerEvents: 'auto',
                            transition: 'color 0.3s',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                                width: isHighlighted ? 6 : 3,
                                height: isHighlighted ? 6 : 3,
                                background: isHighlighted ? 'var(--gold)' : '#333',
                                borderRadius: '50%',
                                marginRight: 6,
                                boxShadow: isHighlighted ? '0 0 10px var(--gold)' : 'none',
                                transition: 'all 0.3s'
                            }} />
                            {node.id}
                        </div>
                    </motion.div>
                )
            })}

            {/* Interaction Puck */}
            {selectionPixel && (
                <motion.div
                    layoutId="puck"
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    style={{
                        position: 'absolute',
                        left: selectionPixel.left,
                        top: selectionPixel.top,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--gold)',
                        boxShadow: '0 0 20px var(--gold), 0 0 40px var(--gold)',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                />
            )}

        </div>
    )
}

const Label = ({ text, top, bottom, left, right, align, vertical }) => (
    <div style={{
        position: 'absolute', top, bottom, left, right,
        color: 'var(--gold)',
        opacity: 0.8,
        fontWeight: 800,
        letterSpacing: 6,
        fontSize: '0.85rem',
        transform: vertical ? (align === 'left' ? 'translateX(-50%) rotate(-90deg)' : 'translateX(50%) rotate(90deg)') : 'translateX(-50%)',
        textAlign: align,
        pointerEvents: 'none',
        zIndex: 5,
        textShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}>
        {text}
    </div>
)
