import {SocketIOCtx} from "groupo-shared-service/types/socketio";
import {GetNullableSQLString} from "../utils/sql";
import {getManager} from "typeorm";
import {TagSocketEvent} from "../socketio/handler";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler} from "groupo-shared-service/services/logger";

/**
 * tag member with specific tag name
 */
export const tagMember = async (ctx: SocketIOCtx, name: string | null) => {
    const query = `UPDATE member SET tag = ${GetNullableSQLString(name)} WHERE member.board_id = '${ctx.boardID}' and member.email = '${ctx.email}';`;
    await getManager().query(query);

    ctx.io.to(ctx.roomID).emit(TagSocketEvent, ctx.email, name);
    LoggingGrpcClient.info(ctx.logger.message("tag user successfully").proto(), grpcHandler);
};
