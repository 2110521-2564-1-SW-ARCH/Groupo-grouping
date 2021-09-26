import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../../.env" });

import path from "path";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = path.resolve(__dirname, "./groupo.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	arrays: true
});

const groupoProto: any = grpc.loadPackageDefinition(packageDefinition);

const grpcServer = new grpc.Server();

grpcServer.addService(groupoProto.GroupingGRPCService.service, {})

grpcServer.bindAsync("localhost:30043", grpc.ServerCredentials.createInsecure(), (err, port) => {
	if (err) console.log(err);
	else {
		console.log(`groupo-grouping (GRPC Server) is running on port ${port}`);
		grpcServer.start();
	}
});