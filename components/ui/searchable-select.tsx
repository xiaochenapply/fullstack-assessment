"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SearchableSelectProps {
    value: string | undefined;
    onValueChange: (value: string | undefined) => void;
    options: string[];
    placeholder: string;
    allLabel: string;
    className?: string;
}

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder,
    allLabel,
    className = "",
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [filterText, setFilterText] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = filterText
        ? options.filter((o) =>
            o.toLowerCase().includes(filterText.toLowerCase())
        )
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setFilterText("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <span className={`truncate ${value ? "" : "text-muted-foreground"}`} title={value || undefined}>
                    {value || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[220px] rounded-md border bg-popover shadow-lg">
                    <div className="p-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-1">
                        <button
                            type="button"
                            onClick={() => {
                                onValueChange(undefined);
                                setOpen(false);
                                setFilterText("");
                            }}
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${!value ? "bg-accent" : ""
                                }`}
                        >
                            {allLabel}
                        </button>
                        {filtered.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onValueChange(option);
                                    setOpen(false);
                                    setFilterText("");
                                }}
                                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${value === option ? "bg-accent" : ""
                                    }`}
                                title={option}
                            >
                                <span className="truncate">{option}</span>
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                                No results found
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
