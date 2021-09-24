import grpc, { ProtobufMessage } from "grpc";
import * as protoLoader from "@grpc/proto-loader";
import path from "path"

const PROTO_PATH = path.resolve(__dirname, "../groupo.proto");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantService: typeof grpc.Client =grpc.loadPackageDefinition(packageDefinition).RestaurantService as (typeof grpc.Client);

export default new restaurantService("localhost:30043", grpc.credentials.createInsecure()) as any;