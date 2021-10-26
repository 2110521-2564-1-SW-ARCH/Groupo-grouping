import {Server} from "socket.io";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler, logger} from "groupo-shared-service/services/logger";

import * as GroupService from "./services/group.service";
import {verifyAuthorization} from "groupo-shared-service/services/authentication";

// create custom server
import http from "http";

export const server = http.createServer();

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

    socket.on("transit", (groupID, position) => {
        GroupService.transit(email, boardID, groupID, position).then(state => {
            io.to(boardID).emit("transit", state.email, state.groupID, state.position);
        }).catch(err => {
            LoggingGrpcClient.error(connectionLogger.set("error", err).message("socket.io cannot transit").proto(), grpcHandler);
        });
    });

    socket.on("disconnect", () => {
        socket.leave(boardID);
        LoggingGrpcClient.info(connectionLogger.message("socket.io disconnected").proto(), grpcHandler);
    });
});

const port = process.env.APP_PORT || "8082";
server.listen(port, () => {
    LoggingGrpcClient.info(logger.set("SOCKET_PORT", port).message("socket.io listening").proto(), grpcHandler);
});
