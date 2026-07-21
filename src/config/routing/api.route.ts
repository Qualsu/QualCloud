export const api = {
    SHRTL: {
        ROOT: "/",
        GET_ALL: (account_id: string) => `/files/get_all`
    },
    NOTTER: {
        ROOT: "/",
        GET_ALL: (account_id: string) => `/files/user/${account_id}`
    },
    FILES: {
        ROOT: "/",
        UPLOAD: "/files/upload",
        UPLOAD_MULTIPLE: "/files/upload/multiple",
        GET_ALL: (account_id: string) => `/files/${account_id}`,
        GET_FOLDERS: (account_id: string) => `/files/folders/${account_id}`,
        GET_RECENT: (account_id: string) => `/files/recent/${account_id}`,
        GET_FOLDER: (folder_id: string) => `/files/folder/${folder_id}`,
        INFO: (file_id: string) => `/files/info/${file_id}`,
        DOWNLOAD: (file_id: string) => `/files/download/${file_id}`,
        MOVE: "/files/move",
        RENAME: "/files/rename",
        PUBLIC: "/files/public",
        FAVORITE: "/files/favorite",
        TRASH: "/files/trash",
        RESTORE: "/files/restore",
        DELETE: (file_id: string) => `/files/${file_id}`,
        FOLDER: "/files/folder",
        FOLDER_RENAME: "/files/folder/rename",
        FOLDER_MOVE: "/files/folder/move",
        FOLDER_TRASH: "/files/folder/trash",
        FOLDER_RESTORE: "/files/folder/restore",
        FOLDER_PUBLIC: "/files/folder/public",
        DOWNLOAD_FOLDER: (account_id: string) => `/files/download-folder/${account_id}`,
        EMPTY_TRASH: (account_id: string) => `/files/empty-trash/${account_id}`,
        USER_STATS: (account_id: string) => `/users/stats/${account_id}`,
        USER_SET_USERNAME: (account_id: string) => `/users/${account_id}/username`,
        USER_SET_AVATAR: (account_id: string) => `/users/${account_id}/avatar`,
    }
}