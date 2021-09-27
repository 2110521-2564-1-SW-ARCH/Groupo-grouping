require("dotenv").config({ path: __dirname + "/../../.env" });
import path from "path"
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { Board } from './models/board.model';
import IBoard from "./typings/Board";
import { v4 as uuidv4 } from "uuid";

const PROTO_PATH = path.resolve(__dirname, "./groupo.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	arrays: true
});

const groupoProto: any = grpc.loadPackageDefinition(packageDefinition);

const grpcServer = new grpc.Server();

let boards: IBoard[] = [];

grpcServer.addService(groupoProto.GroupingGRPCService.service, {
  // getAllMenu: async (_, callback) => {
  //   callback(null, { menu });
  // },
  getBoard: async (call, callback) => {
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
  newBoard: async (call, callback) => {
    let board = call.request;

    board.id = uuidv4();
		board.groups = [];
    boards.push(board);
    callback(null, board);
  },
  updateBoard: async (call, callback) => {
    // let existingMenuItem = await Menu.findOne({
    //   _id: ObjectId(call.request.id)
    // })

    if (false) {
      // existingMenuItem.name = call.request.name;
      // existingMenuItem.price = call.request.price;
      // await existingMenuItem.save();
      // callback(null, existingMenuItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
  removeBoard: async (call, callback) => {
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