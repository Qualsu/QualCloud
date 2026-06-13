import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

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
    const urlQuery = searchParams.get("q") ?? "";
    const activeQuery = syncWithUrl ? urlQuery : query ?? "";

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: activeQuery,
        },
    });

    useEffect(() => {
        form.reset({ query: activeQuery });
    }, [activeQuery, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const nextQuery = values.query.trim();

        if (syncWithUrl) {
            const params = new URLSearchParams(searchParams.toString());

            if (nextQuery) {
                params.set("q", nextQuery);
            } else {
                params.delete("q");
            }

            router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            return;
        }

        setQuery?.(nextQuery);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Поиск файлов..."
                                    className="min-w-[220px] border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-purple-500/30 md:min-w-[320px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
