export enum Role {
    System = "system",
    Assistant = "assistant",
    User = "user",
}

export interface Message {
    role: Role,
    content: string,
}