## Grouping Service

<hr>

### API Interface

all interfaces are in `common-shared-service`.

##### Auth Required Interface

to use these interface, `Authorization` header must be provided with `Bearer` token

- `GET /board (EMPTY => BoardResponse[])`, list board (including own and be member)


- `POST /board (CreateBoardRequest => EMPTY)`, to create new board


- `POST /board/:boardID/invite (BoardInvitationRequest => EMPTY)`, to invite people to 
