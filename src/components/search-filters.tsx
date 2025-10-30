
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface SearchFiltersProps {
    owners: { id: string; name: string }[];
}

const fileTypes = ['PDF', 'Word', 'Image', 'Spreadsheet', 'Presentation', 'TXT'];

export function SearchFilters({ owners }: SearchFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [type, setType] = useState(searchParams.get('type') || '');
    const [owner, setOwner] = useState(searchParams.get('owner') || '');
    
    const [date, setDate] = useState<DateRange | undefined>(() => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        if (from && to) {
            return {
                from: parse(from, 'yyyy-MM-dd', new Date()),
                to: parse(to, 'yyyy-MM-dd', new Date())
            };
        }
        return undefined;
    });

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (type) params.set('type', type); else params.delete('type');
        if (owner) params.set('owner', owner); else params.delete('owner');
        if (date?.from) params.set('from', format(date.from, 'yyyy-MM-dd')); else params.delete('from');
        if (date?.to) params.set('to', format(date.to, 'yyyy-MM-dd')); else params.delete('to');
        
        // Use replace to avoid pushing duplicate entries into browser history
        router.replace(`/search?${params.toString()}`);

    }, [type, owner, date, router, searchParams]);

    const clearAllFilters = () => {
        setType('');
        setOwner('');
        setDate(undefined);
    }
    
    const hasActiveFilters = !!type || !!owner || !!date;

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-muted/50 rounded-lg border">
            <h3 className="hidden md:flex items-center gap-2 font-semibold text-sm mr-2">
                <Filter className="h-4 w-4" />
                Filters
            </h3>

            <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full md:w-[180px] bg-background">
                    <SelectValue placeholder="File type" />
                </SelectTrigger>
                <SelectContent>
                    {fileTypes.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="w-full md:w-[180px] bg-background">
                    <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                    {owners.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full md:w-[240px] justify-start text-left font-normal bg-background",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            
            {hasActiveFilters && (
                <Button variant="ghost" onClick={clearAllFilters} className="text-sm">
                    <X className="mr-2 h-4 w-4"/>
                    Clear
                </Button>
            )}
        </div>
    );
}
