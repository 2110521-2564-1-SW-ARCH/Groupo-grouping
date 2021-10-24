import {server} from "./index";

import {Server} from "socket.io";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler, logger} from "groupo-shared-service/services/logger";

import * as GroupService from "./services/group.service";
import {verifyAuthorization} from "groupo-shared-service/services/authentication";

export const io = new Server(server, {cors: {origin: "*"}});

io.on("connection", (socket) => {
    const {boardID, token} = socket.handshake.query as {boardID: string, token: string};
    const connectionLogger = logger.set("boardID", boardID);

    let email: string;
    try {
        email = verifyAuthorization(token).email;
    } catch (err) {
        LoggingGrpcClient.error(connectionLogger.set("error", err).message("socket.io unauthorized error").proto(), grpcHandler);
        socket.disconnect();
        return;
    }
    LoggingGrpcClient.info(connectionLogger.message("socket.io connected").proto(), grpcHandler);

    socket.join(boardID);

    socket.on("transit", (groupID) => {
        GroupService.transit(email, boardID, groupID).then(state => {
            io.to(boardID).emit("transit", state.email, state.groupID);
        }).catch(err => {
            LoggingGrpcClient.error(connectionLogger.set("error", err).message("socket.io cannot transit").proto(), grpcHandler);
        });
    });

    socket.on("disconnect", () => {
        socket.leave(boardID);
        LoggingGrpcClient.info(connectionLogger.message("socket.io disconnected").proto(), grpcHandler);
    });
});
