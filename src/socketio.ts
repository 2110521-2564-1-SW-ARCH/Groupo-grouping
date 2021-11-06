import {Server, Socket} from "socket.io";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {handler as grpcHandler, logger} from "groupo-shared-service/services/logger";

import http from "http";
import {DefaultEventsMap} from "socket.io/dist/typed-events";
import {getSocketIOContext} from "groupo-shared-service/services/socketio";
import {groupHandlerBuilder, tagHandlerBuilder, transitHandlerBuilder} from "./socketio/handler";

export const server = http.createServer();

export const io = new Server(server, {cors: {origin: "*"}});

io.on("connection", (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
    const ctx = getSocketIOContext(io, socket);

    if (ctx === null) {
        LoggingGrpcClient.error(logger.message("socket.io unauthorized error").proto(), grpcHandler);
        return;
    }

    ctx.logger.service("grouping-service/socket.io");

    LoggingGrpcClient.info(ctx.logger.message("connection established").proto(), grpcHandler);


    // transit event is an event that indicate the group of the user is change
    socket.on("transit", transitHandlerBuilder(ctx));

    // tag event is an event for tag CRUD
    socket.on("tag", tagHandlerBuilder(ctx));

    // group event is an event for group CRUD
    socket.on("group", groupHandlerBuilder(ctx));

    // disconnect is on the user is disconnect
    socket.on("disconnect", () => {
        socket.leave(ctx.roomID);
        LoggingGrpcClient.info(ctx.logger.message("socket.io disconnected").proto(), grpcHandler);
    });
});

const port = process.env.SOCKET_PORT || "8082";
server.listen(port, () => {
    LoggingGrpcClient.info(logger.set("SOCKET_PORT", port).message("socket.io listening").proto(), grpcHandler);
});
