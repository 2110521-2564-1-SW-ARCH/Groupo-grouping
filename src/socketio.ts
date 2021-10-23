import {server} from "./index";

import {Server} from "socket.io";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler, logger} from "groupo-shared-service/services/logger";

import * as GroupService from "./services/group.service";
import {verifyAuthorizationIncomingHeaders} from "groupo-shared-service/services/authentication";

export const io = new Server(server);

io.on("connection", (socket) => {
    const {email} = verifyAuthorizationIncomingHeaders(socket.handshake.headers);
    const {boardID} = socket.handshake.query as {boardID: string};
    const connectionLogger = logger.set("boardID", boardID);
    LoggingGrpcClient.info(connectionLogger.message("socket.io connected").proto(), grpcHandler);

    socket.join(boardID);

    socket.on("transit", (from, to) => {
        GroupService.transit(email, from, to).then(() => {
            io.to(boardID).emit("transit", email, from, to);
        }).catch(err => console.log(err));
    });

    socket.on("disconnect", () => {
        socket.leave(boardID);
        LoggingGrpcClient.info(connectionLogger.message("socket.io disconnected").proto(), grpcHandler);
    });
});
