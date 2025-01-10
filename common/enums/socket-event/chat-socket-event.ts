export enum ChatSocketEvent {
    JoinChat = 'joinChat',
    PostMessage = 'postChatMessage',
    GetMessage = 'getChatMessage',
    UserLeft = 'userLeftChat',
    LeaveChat = 'leaveChat',
    BanUser = 'banChatUser',
    OnUserBanned = 'onChatUserBanned',
    UpdateUsername = 'updateChatUsername',
}
