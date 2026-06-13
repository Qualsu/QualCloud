"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSearchSuggestions } from "@/components/search-suggestions-context";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SearchBarProps } from "@/config/types/components.types";

const formSchema = z.object({
    query: z.string().min(0).max(99),
});

export function SearchBar({ query, setQuery, syncWithUrl = false }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { suggestions } = useSearchSuggestions();
    const containerRef = useRef<HTMLDivElement>(null);
    const urlQuery = searchParams.get("q") ?? "";
    const activeQuery = syncWithUrl ? urlQuery : query ?? "";
    const [isFocused, setIsFocused] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: activeQuery,
        },
    });

    const formQuery = form.watch("query") ?? "";

    const filteredSuggestions = useMemo(() => {
        const normalizedQuery = formQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return [];
        }

        return suggestions
            .filter((suggestion) => suggestion.toLowerCase().includes(normalizedQuery))
            .filter((suggestion) => suggestion.toLowerCase() !== normalizedQuery)
            .slice(0, 6);
    }, [formQuery, suggestions]);

    const showSuggestions = isFocused && filteredSuggestions.length > 0;

    useEffect(() => {
        form.reset({ query: activeQuery });
        setActiveSuggestionIndex(-1);
    }, [activeQuery, form]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsFocused(false);
                setActiveSuggestionIndex(-1);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setActiveSuggestionIndex(-1);
    }, [formQuery]);

    async function applyQuery(nextQuery: string) {
        const trimmedQuery = nextQuery.trim();

        if (syncWithUrl) {
            const params = new URLSearchParams(searchParams.toString());

            if (trimmedQuery) {
                params.set("q", trimmedQuery);
            } else {
                params.delete("q");
            }

            router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            setIsFocused(false);
            setActiveSuggestionIndex(-1);
            return;
        }

        setQuery?.(trimmedQuery);
        setIsFocused(false);
        setActiveSuggestionIndex(-1);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await applyQuery(values.query);
    }

    function handleSuggestionSelect(suggestion: string) {
        form.setValue("query", suggestion, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });

        void applyQuery(suggestion);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex items-start gap-2">
                <div ref={containerRef} className="relative z-50">
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Поиск файлов..."
                                        className="w-[140px] min-w-0 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-purple-500/30 sm:w-[180px] md:w-auto md:min-w-[320px]"
                                        autoComplete="off"
                                        {...field}
                                        onFocus={() => setIsFocused(true)}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            setIsFocused(true);
                                        }}
                                        onKeyDown={(event) => {
                                            if (!showSuggestions) {
                                                return;
                                            }

                                            if (event.key === "ArrowDown") {
                                                event.preventDefault();
                                                setActiveSuggestionIndex((currentIndex) =>
                                                    currentIndex >= filteredSuggestions.length - 1 ? 0 : currentIndex + 1
                                                );
                                            }

                                            if (event.key === "ArrowUp") {
                                                event.preventDefault();
                                                setActiveSuggestionIndex((currentIndex) =>
                                                    currentIndex <= 0 ? filteredSuggestions.length - 1 : currentIndex - 1
                                                );
                                            }

                                            if (event.key === "Escape") {
                                                setIsFocused(false);
                                                setActiveSuggestionIndex(-1);
                                            }

                                            if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                                                event.preventDefault();
                                                handleSuggestionSelect(filteredSuggestions[activeSuggestionIndex]);
                                            }
                                        }}
                                    />
                                </FormControl>
                                {showSuggestions && (
                                    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] w-full overflow-hidden rounded-xl border border-white/10 bg-[#211428] shadow-2xl">
                                        <ul className="py-1">
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <li key={suggestion}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full items-center px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white ${
                                                            index === activeSuggestionIndex ? "bg-white/10 text-white" : ""
                                                        }`}
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => handleSuggestionSelect(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="border border-white/10 bg-white/5 px-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <SearchIcon size={16} />
                    )}
                </Button>
            </form>
        </Form>
    );
}
