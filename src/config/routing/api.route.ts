export const api = {
    SHRTL: {
        ROOT: "/",
        GET_ALL: (account_id: string) => `/files/get_all/${account_id}`
    },
    NOTTER: {
        ROOT: "/",
        GET_ALL: (account_id: string) => `/files/user/${account_id}`
    }
}