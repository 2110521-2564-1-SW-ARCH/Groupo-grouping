import {getConnection, getManager} from "typeorm";
import {Group} from "../models/group.model";
import {UnauthorizedError} from "groupo-shared-service/apiutils/errors";
import * as BoardService from "./board.service";
import {SocketIOCtx} from "groupo-shared-service/types/socketio";
import {GroupSocketEvent, TransitSocketEvent} from "../socketio/handler";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler} from "groupo-shared-service/services/logger";
import {GroupInfo} from "./interface";
import {GetNullableSQLString} from "../utils/sql";
import {MemberQueryResult} from "../models/member.model";
import { ExpressRequestCtx } from "groupo-shared-service/types/express";
import { shuffleArray } from "../utils/shuffle";
import { GroupResponse } from "groupo-shared-service/apiutils/messages";

const canModifyGroup = async (ctx: SocketIOCtx) => {
    const isOwner = await BoardService.isOwner(ctx.email, ctx.boardID);
    if (!isOwner) {
        throw new UnauthorizedError("access denied");
    }
};

/**
 * create group with specific `name` and `description`
 */
export const create = async (ctx: SocketIOCtx, groupInfo: GroupInfo) => {
    await canModifyGroup(ctx);
    const insertResult = await getConnection()
        .createQueryBuilder()
        .insert()
        .into<Group>(Group)
        .values({name: groupInfo.name, description: groupInfo.description, board: {boardID: ctx.boardID}, tags: "[]"})
        .execute();
    ctx.io.to(ctx.roomID).emit(GroupSocketEvent, "create", insertResult.identifiers[0], JSON.stringify(groupInfo));
    LoggingGrpcClient.info(ctx.logger.message("create group successfully").proto(), grpcHandler);
};

/**
 * update group with specific `name` and `description`
 */
export const update = async (ctx: SocketIOCtx, groupID: string, groupInfo: GroupInfo) => {
    await canModifyGroup(ctx);
    const query = `UPDATE \`group\` SET name = '${groupInfo.name}', description = ${GetNullableSQLString(groupInfo.description)}, tags = ${GetNullableSQLString(JSON.stringify(groupInfo.tags))} WHERE group.group_id = '${groupID}';`;
    console.log(query);
    await getManager().query(query);
    ctx.io.to(ctx.roomID).emit(GroupSocketEvent, "update", groupID, JSON.stringify(groupInfo));
    LoggingGrpcClient.info(ctx.logger.message("update group successfully").proto(), grpcHandler);
};

/**
 * remove group by ID
 */
export const remove = async (ctx: SocketIOCtx, groupID: string) => {
    await canModifyGroup(ctx);

    const memberQuery = `SELECT * FROM member WHERE member.board_id = '${ctx.boardID}' and member.group_id = '${groupID}';`;
    const members: MemberQueryResult[] = await getManager().query(memberQuery);
    const unassignedQuery = `UPDATE member SET group_id = NULL WHERE member.board_id = '${ctx.boardID}' and member.group_id = '${groupID}';`;
    await getManager().query(unassignedQuery);
    for (const member of members) {
        ctx.io.to(ctx.roomID).emit(TransitSocketEvent, member.email, null, 0);
    }

    const query = `DELETE FROM \`group\` WHERE group.group_id = '${groupID}';`;
    await getManager().query(query);
    ctx.io.to(ctx.roomID).emit(GroupSocketEvent, "delete", groupID);
    LoggingGrpcClient.info(ctx.logger.message("delete group successfully").proto(), grpcHandler);
};

/**
 * transit user to another group
 */
export const transit = async (ctx: SocketIOCtx, groupID: string | null, position: number) => {
    const query = `UPDATE member SET group_id = ${GetNullableSQLString(groupID)} WHERE member.board_id = '${ctx.boardID}' and member.email = '${ctx.email}';`;
    await getManager().query(query);

    ctx.io.to(ctx.roomID).emit(TransitSocketEvent, ctx.email, groupID, position);
    LoggingGrpcClient.info(ctx.logger.message("transit user successfully").proto(), grpcHandler);
};

export const autoGroup = async (ctx: ExpressRequestCtx<undefined>, boardID: string) => {
    let board = await BoardService.findByID(ctx, boardID);
    let members: MemberQueryResult[] = shuffleArray<MemberQueryResult>(await BoardService.getMembers(boardID));

    const query = `UPDATE member SET group_id = null WHERE member.board_id = '${boardID}';`;
    await getManager().query(query);

    let groupCapacity: {[k: string]: number} = {};

    for (let member of members) {
        let member_tags = new Set(JSON.parse(member.tags || "[]"));

        let maxScore = -1;
        let maxGroupId = null;

        let groups: GroupResponse[] = shuffleArray<GroupResponse>(board.groups);

        for (let group of groups) {
            if (!groupCapacity[group.groupID]) groupCapacity[group.groupID] = 0;
            let group_tags = new Set(group.tags);
        }
    }
}
