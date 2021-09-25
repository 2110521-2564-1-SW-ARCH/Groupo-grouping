import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, "../../groupo.proto");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const groupingService: any = grpc.loadPackageDefinition(packageDefinition).groupingService;
export const gprcClient = new groupingService.GroupingService("localhost:30043", grpc.credentials.createInsecure());