import {server} from "./index";

import {Server} from "socket.io";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler, logger} from "groupo-shared-service/services/logger";

import * as GroupService from "./services/group.service";
import {verifyAuthorization} from "groupo-shared-service/services/authentication";

export const io = new Server(server, {cors: {origin: "*"}});

io.on("connection", (socket) => {
    const {boardID, token} = socket.handshake.query as {boardID: string, token: string};
    const {email} = verifyAuthorization(token);
    const connectionLogger = logger.set("boardID", boardID);
    LoggingGrpcClient.info(connectionLogger.message("socket.io connected").proto(), grpcHandler);

    socket.join(boardID);

    socket.on("transit", (groupID) => {
        GroupService.transit(email, boardID, groupID).then(() => {
            io.to(boardID).emit("transit", email, groupID);
        }).catch(err => console.log(err));
    });

    socket.on("disconnect", () => {
        socket.leave(boardID);
        LoggingGrpcClient.info(connectionLogger.message("socket.io disconnected").proto(), grpcHandler);
    });
});
