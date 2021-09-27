require("dotenv").config({ path: __dirname + "/../../.env" });
import path from "path"
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import IBoard from "./typings/Board";
import { v4 as uuidv4 } from "uuid";
import { ServiceClientConstructor } from "@grpc/grpc-js/build/src/make-client";
import IGroup from "./typings/Group";

const PROTO_PATH = path.resolve(__dirname, "./groupo.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	arrays: true
});

interface GroupoServiceClientConstructor {
	GroupingGRPCService: ServiceClientConstructor;
}

const groupoProto: GroupoServiceClientConstructor = grpc.loadPackageDefinition(packageDefinition) as unknown as GroupoServiceClientConstructor;

const grpcServer = new grpc.Server();

let boards: IBoard[] = [];

grpcServer.addService(groupoProto.GroupingGRPCService.service, {
  // getAllMenu: async (_, callback) => {
  //   callback(null, { menu });
  // },
  getBoard: async (call: any, callback: any) => {
    let board = boards.find((n) => n.id == call.request.id);

    if (board) {
      callback(null, board);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  newBoard: async (call: any, callback: any) => {
    let board = call.request;

    board.id = uuidv4();
		board.groups = [];
    boards.push(board);
    callback(null, board);
  },
  newGroup: async (call: any, callback: any) => {
    let board = boards.find(board => board.id == call.request.boardId);

    if (board) {
      let group: IGroup = {
        id: uuidv4(),
        users: [],
      };

      board.groups.push(group);

      callback(null, group);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
  updateBoard: async (call: any, callback: any) => {
    let board = boards.find(board => board.id == call.request.boardId);

    if (board) {
      let groupFrom = !call.groupFrom ? true : board.groups.find(group => group.id == call.request.groupFrom);
      let groupTo = !call.groupTo ? true : board.groups.find(group => group.id == call.request.groupTo);

      if (groupFrom && groupTo) {
        if (groupFrom !== true) {
          let index = groupFrom.users.findIndex(user => user.id == call.request.userId);
          if (index != -1) {
            groupFrom.users.splice(index, 1);
          }
        }

        if (groupTo !== true) {
          if (!groupTo.users.find(user => user.id == call.request.userId)) {
            groupTo.users.push({
              id: call.request.userId,
            })
          }
        }
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Not Found",
        });
      }
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
  removeBoard: async (call: any, callback: any) => {
    let boardIndex = boards.findIndex(board => board.id == call.request.id);

    if (boardIndex != -1) {
      boards.splice(boardIndex, 1);
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
})

grpcServer.bindAsync("localhost:30043", grpc.ServerCredentials.createInsecure(), (err, port) => {
	if (err) console.log(err);
	else {
		console.log(`groupo-grouping (GRPC Server) is running on port ${port}`);
		grpcServer.start();
	}
});