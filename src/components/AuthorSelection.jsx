import { motion } from 'framer-motion'
import { User, Check, Star, BookOpen } from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
}

export default function AuthorSelection({ authors, selectedIds, onToggle, onConvene }) {
    // Sort by status (Favourite first) then Name
    const sortedAuthors = [...authors].sort((a, b) => {
        if (a.status === 'Favourite' && b.status !== 'Favourite') return -1
        if (a.status !== 'Favourite' && b.status === 'Favourite') return 1
        return a.name.localeCompare(b.name)
    })

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Action Bar */}
            <div style={{
                position: 'sticky',
                top: 20,
                zIndex: 100,
                backgroundColor: 'rgba(15, 16, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>Board Members</span>
                    <span style={{
                        backgroundColor: selectedIds.length === 5 ? 'var(--gold)' : 'var(--bg-accent)',
                        color: selectedIds.length === 5 ? '#000' : 'var(--text-secondary)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        {selectedIds.length}/5 Selected
                    </span>
                </div>

                <button
                    onClick={onConvene}
                    disabled={selectedIds.length === 0}
                    style={{
                        backgroundColor: selectedIds.length > 0 ? 'var(--gold)' : 'var(--bg-accent)',
                        color: selectedIds.length > 0 ? '#000' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: selectedIds.length > 0 ? 1 : 0.5,
                        transition: 'all 0.2s'
                    }}
                >
                    {selectedIds.length > 0 ? "Convene Board" : "Select Members"}
                </button>
            </div>

            {/* Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem'
                }}
            >
                {sortedAuthors.map(author => {
                    const isSelected = selectedIds.includes(author.id)
                    const isFavourite = author.status === 'Favourite'

                    return (
                        <motion.div
                            key={author.id}
                            variants={item}
                            onClick={() => onToggle(author.id)}
                            style={{
                                backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-card)',
                                border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                                borderRadius: '12px',
                                padding: '1.2rem',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                            whileHover={{ y: -2, borderColor: isSelected ? 'var(--gold)' : '#444' }}
                        >
                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    color: 'var(--gold)'
                                }}>
                                    <Check size={18} />
                                </div>
                            )}

                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isSelected ? 'var(--gold)' : 'var(--text-secondary)'
                            }}>
                                <User size={20} />
                            </div>

                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                {author.name}
                            </h3>

                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {isFavourite && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold-dim)' }}>
                                        <Star size={12} fill="currentColor" /> Star
                                    </span>
                                )}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <BookOpen size={12} /> {author.quotes.length}
                                </span>
                            </div>

                            {/* Top Topics (mini tags) */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto', paddingTop: '8px' }}>
                                {author.topics.slice(0, 2).map(t => (
                                    <span key={t} style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--bg-dark)',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {t}
                                    </span>
                                ))}
                                {author.topics.length > 2 && (
                                    <span style={{ fontSize: '0.7rem', color: '#555' }}>+{author.topics.length - 2}</span>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}
