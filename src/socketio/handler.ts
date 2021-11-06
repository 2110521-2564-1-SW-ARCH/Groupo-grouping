import * as GroupService from "../services/group.service";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler} from "groupo-shared-service/services/logger";
import {SocketIOCtx} from "groupo-shared-service/types/socketio";
import {GroupInfo} from "../services/interface";

export const TransitSocketEvent = "transit";
export const TagSocketEvent = "tag";
export const GroupSocketEvent = "group";

export const transitHandlerBuilder = (ctx: SocketIOCtx) => {
    return (groupID: string, position: number) => {
        ctx = {...ctx, logger: ctx.logger.set("groupID", groupID).set("position", position.toString())};
        GroupService.transit(ctx, groupID, position).catch(err => {
            LoggingGrpcClient.error(ctx.logger.setError(err).message("cannot transit user"), grpcHandler);
        });
    };
};

export const tagHandlerBuilder = (ctx: SocketIOCtx) => {
    return (action: "") => {

    };
};

export const groupHandlerBuilder = (ctx: SocketIOCtx) => {
    // groupID can be an empty string for create event
    // info is an JSON.stringify string for group info
    return (action: "create" | "update" | "delete", groupID: string, groupInfo: GroupInfo) => {
        ctx = {...ctx, logger: ctx.logger.set("action", action).set("groupID", groupID).set("groupInfo", JSON.stringify(groupInfo))};
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
