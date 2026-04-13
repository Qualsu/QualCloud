import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, SearchIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

const formSchema = z.object({
    query: z.string().min(0).max(99),
})

export function SearchBar({query, setQuery}: {query: string, setQuery: Dispatch<SetStateAction<string>>}){
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setQuery(values.query)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-center">
                <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input
                                placeholder="Поиск файлов..."
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-purple-500/30 min-w-[200px]"
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
                    className="border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors px-3"
                >
                    {form.formState.isSubmitting
                        ? <Loader2 className="h-4 w-4 animate-spin"/>
                        : <SearchIcon size={16}/>
                    }
                </Button>
            </form>
        </Form>
    )
}