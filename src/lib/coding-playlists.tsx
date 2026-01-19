// src/lib/coding-playlists.tsx
import { Network, Database, Layers } from 'lucide-react'

export const CODING_PLAYLISTS = [
    {
        id: 'google',
        title: "Google's Top 50",
        description: "Most frequently asked questions in Google L3/L4 interviews.",
        // Official Google "G" Logo
        icon: (
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.52 12.29c0-.85-.08-1.68-.23-2.48H12v4.7h6.45c-.28 1.48-1.12 2.73-2.38 3.57v2.96h3.86c2.26-2.09 3.56-5.17 3.56-8.75z" fill="#4285F4"/>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.96c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.32v3.11C3.33 21.43 7.42 24 12 24z" fill="#34A853"/>
                <path d="M5.27 14.29c-.25-.74-.39-1.54-.39-2.36s.14-1.61.39-2.36V6.45H1.32C.48 8.12 0 10 0 12s.48 3.88 1.32 5.55l3.95-3.26z" fill="#FBBC05"/>
                <path d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.44-3.44C17.94 1.15 15.23 0 12 0 7.42 0 3.33 2.57 1.32 6.45l3.95 3.26c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
            </svg>
        ),
        color: "bg-blue-50 text-blue-700 border-blue-200",
        filter: "Google",
    },
    {
        id: 'meta',
        title: "Meta's Favorites",
        description: "High-frequency production engineering questions.",
        icon: "M",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        filter: "Meta",
    },
    {
        id: 'amazon',
        title: "Amazon Leadership",
        description: "Standard OA questions for SDE-1 and SDE-2.",
        icon: "A",
        color: "bg-orange-50 text-orange-700 border-orange-200",
        filter: "Amazon",
    },
    {
        id: 'graph',
        title: "Graph Masters",
        description: "Conquer BFS, DFS and Topology Sort.",
        icon: <Network className="w-8 h-8" />,
        color: "bg-purple-50 text-purple-700 border-purple-200",
        filter: "Graph",
    },
    {
        id: 'microsoft',
        title: "Microsoft Top 50",
        description: "Master Matrices, Linked Lists and practical manipulation.",
        // Official Microsoft "4 Squares" Logo
        icon: (
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
                <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
                <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
            </svg>
        ),
        color: "bg-cyan-50 text-cyan-700 border-cyan-200",
        filter: "Microsoft",
    },
    {
        id: 'apple',
        title: "Apple Selections",
        description: "High-performance optimization, Math and Design problems.",
        // Official Apple Logo
        icon: (
            <svg viewBox="0 0 384 512" className="w-7 h-7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
            </svg>
        ),
        color: "bg-zinc-50 text-zinc-900 border-zinc-200",
        filter: "Apple",
    },
    {
        id: 'sql',
        title: "SQL 50",
        description: "Crack the SQL round. Joins, Group By and Window Functions.",
        icon: <Database className="w-8 h-8" />,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        filter: "SQL",
    },
    {
        id: 'design',
        title: "System Design (LLD)",
        description: "Object-Oriented Design problems like 'Design Twitter' or 'LRU Cache'.",
        icon: <Layers className="w-8 h-8" />,
        color: "bg-rose-50 text-rose-700 border-rose-200",
        filter: "Design",
    }
]