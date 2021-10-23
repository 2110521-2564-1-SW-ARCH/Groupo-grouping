import {server} from "./index";

import {Server} from "socket.io";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler, logger} from "groupo-shared-service/services/logger";

const io = new Server(server);

io.on("connection", (socket) => {
    const {boardID} = socket.handshake.query as {boardID: string};
    const connectionLogger = logger.set("boardID", boardID);
    LoggingGrpcClient.info(connectionLogger.message("socket.io connected").proto(), grpcHandler);
    socket.join(boardID);
    socket.on('disconnect', () => {
        LoggingGrpcClient.info(connectionLogger.message("socket.io disconnected").proto(), grpcHandler);
    });
});
