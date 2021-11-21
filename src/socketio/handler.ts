import * as GroupService from "../services/group.service";
import * as TagService from "../services/tag.service";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler} from "groupo-shared-service/services/logger";
import {SocketIOCtx} from "groupo-shared-service/types/socketio";
import {GroupInfo} from "../services/interface";
import { deleteBoard, leaveBoard } from "../services/board.service";

export const TransitSocketEvent = "transit";
export const TagSocketEvent = "tag";
export const GroupSocketEvent = "group";
export const BoardSocketEvent = "board";
export const ChatSocketEvent = "chat";
export const JoinSocketIOEvent = "join";
export const AutoGroupSocketEvent = "autogroup";

export const transitHandlerBuilder = (ctx: SocketIOCtx) => {
    return (groupID: string, position: number) => {
        ctx = {...ctx, logger: ctx.logger.set("groupID", groupID).set("position", position.toString())};
        GroupService.transit(ctx, groupID, position).catch(err => {
            LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot transit user").proto(), grpcHandler);
        });
    };
};

export const tagHandlerBuilder = (ctx: SocketIOCtx) => {
    return (name: string) => {
        ctx = {...ctx, logger: ctx.logger.set("name", name)};
        TagService.tagMember(ctx, name).catch(err => {
            LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot create group").proto(), grpcHandler);
        });
    };
};

export const chatHandlerBuilder = (ctx: SocketIOCtx) => {
    return (message: string) => {
        ctx = {...ctx, logger: ctx.logger.set("message", message)};
        ctx.io.to(ctx.roomID).emit(ChatSocketEvent, ctx.email, message);
    };
};

export const groupHandlerBuilder = (ctx: SocketIOCtx) => {
    // groupID can be an empty string for create event
    // info is an JSON.stringify string for group info
    return (action: "create" | "update" | "delete", groupID: string, groupInfo: GroupInfo) => {
        ctx = {
            ...ctx,
            logger: ctx.logger.set("action", action).set("groupID", groupID).set("groupInfo", JSON.stringify(groupInfo))
        };
        switch (action) {
            case "create":
                GroupService.create(ctx, groupInfo).catch(err => {
                    LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot create group").proto(), grpcHandler);
                });
                break;
            case "update":
                GroupService.update(ctx, groupID, groupInfo).catch(err => {
                    LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot update group").proto(), grpcHandler);
                });
                break;
            case "delete":
                GroupService.remove(ctx, groupID).catch(err => {
                    LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot delete group").proto(), grpcHandler);
                });
                break;
        }
    };
};

export const boardHandlerBuilder = (ctx: SocketIOCtx) => {
    // groupID can be an empty string for create event
    // info is an JSON.stringify string for group info
    return (action: "leave" | "delete", boardID: string) => {
        ctx = {
            ...ctx,
            logger: ctx.logger.set("action", action).set("boardID", boardID)
        };
        switch (action) {
            case "leave":
                leaveBoard(ctx.email, ctx.boardID)
                    .then(() => ctx.io.to(ctx.roomID).emit(BoardSocketEvent, "leaveBoard", boardID, ctx.email))
                    .catch(err => LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot leave board").proto(), grpcHandler))
                break;
            case "delete":
                deleteBoard(ctx.email, ctx.boardID)
                    .then(() => ctx.io.to(ctx.roomID).emit(BoardSocketEvent, "deleteBoard", boardID, ctx.email))
                    .catch(err => LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot leave board").proto(), grpcHandler))
                break;
        }
    };
};

export const autogroupHandlerBuilder = (ctx: SocketIOCtx) => {
    return (boardID: string) => {
        ctx = {...ctx, logger: ctx.logger.set("boardID", boardID)};
        GroupService.autoGroup(ctx, boardID).catch(err => {
            LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot transit user").proto(), grpcHandler);
        });
    };
};
