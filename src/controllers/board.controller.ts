import express from "express";
import {catcher} from "groupo-shared-service/apiutils/errors";
import * as BoardService from "../services/board.service";
import {
    BoardInvitationRequest,
    BoardResponse,
    CreateBoardRequest,
    CreateBoardResponse,
    json,
    newAPIResponse
} from "groupo-shared-service/apiutils/messages";
import {verifyAuthorizationHeader} from "groupo-shared-service/services/authentication";
import {StatusCodes} from "http-status-codes";

export const createBoard: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const {name, totalGroup, tags} = req.body as CreateBoardRequest;

    const boardID = await BoardService.createBoard(email, name, totalGroup, tags);

    json(res, newAPIResponse<CreateBoardResponse>(StatusCodes.OK, {boardID}));
});

export const addMember: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const {members} = req.body as BoardInvitationRequest;

    await BoardService.addMember(email, req.params.boardID, members);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
});

export const listBoard: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const boards = await BoardService.listBoards(email);

    json(res, newAPIResponse<BoardResponse[]>(StatusCodes.OK, boards.map(e => e.board.response(e.isAssign))));
});

export const getBoard: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const board = await BoardService.getBoard(email, req.params.boardID);

    json(res, newAPIResponse<BoardResponse>(StatusCodes.OK, board.response()));
});
