"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatRelative } from "date-fns"
import { useQuery } from "convex/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { FavoritedFile, UserCellProps } from "@/config/types/components.types"
import { api } from "../../../../convex/_generated/api"
import { FileCardActions } from "./file-actions"

function UserCell({ userId }: UserCellProps){
    const userProfile = useQuery(api.users.getUserProfile, {
        userId: userId
    })
    return (
        <div className="flex gap-2 text-white/50 items-center">
            <Avatar className="w-7 h-7">
                <AvatarImage src={userProfile?.image} />
                <AvatarFallback className="text-xs bg-white/10 text-white/60">
                    {userProfile?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
            </Avatar>
            {userProfile?.name}
        </div>
    )
}

export const columns: ColumnDef<FavoritedFile>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "User",
    cell: ({ row }) => {
        return <UserCell userId={row.original.userId}/>
      },
  },
  {
    accessorKey: "Uploaded On",
    cell: ({ row }) => {
        return <div>{formatRelative(new Date(row.original._creationTime), new Date())}</div>
      },
  },
  {
    accessorKey: "Actions",
    cell: ({ row }) => {
        return <div><FileCardActions file={row.original} isFavorited={row.original.isFavorited}/></div>
      },
  }
]
