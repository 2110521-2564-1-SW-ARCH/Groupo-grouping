## Grouping Service

<hr>

### Environment Variable

application configuration

- `APP_PORT`, to assign listening port to this service.

mysql configuration

- `MYSQL_HOST`, to select mysql host.
- `MYSQL_USER`, to select mysql user.
- `MYSQL_PASSWORD`, to authenticate mysql connection.
- `MYSQL_DB`, to select default database when initiate connection.

jwt configuration
- `JWT_SECRET`, to verify JWT access token and refresh token.

gRPC configuration
- `GRPC_SERVER_HOST`, to select gRPC server host.
- `GRPC_SERVER_PORT`, to select gRPC server port.

<hr>

### API Interface

authentication required endpoint, `Authorization` header must be provided with `Bearer` token.


- `GET /board (EMPTY => BoardResponse[])`, list board (including own and be member)


- `POST /board (CreateBoardRequest => EMPTY)`, to create new board


- `POST /board/:boardID/invite (BoardInvitationRequest => EMPTY)`, to invite people to specific board 
