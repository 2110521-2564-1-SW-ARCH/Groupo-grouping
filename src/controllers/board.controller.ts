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
import { MemberResponse } from "../models/member.model";
import {joinBoard} from "../services/board.service";

export const createBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {name, totalGroup, tags} = req.body as CreateBoardRequest;

    const boardID = await BoardService.createBoard(email, name, totalGroup, tags);

    json(res, newAPIResponse<CreateBoardResponse>(StatusCodes.OK, {boardID}));
    next();
});

export const addMember: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {members} = req.body as BoardInvitationRequest;

    await BoardService.addMember(email, req.params.boardID, members);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

export const getBoardInvitations: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, req.params.boardID, (board) => !board.isJoined);

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members.map(e => e.response())));
    next();
});

export const getBoardMembers: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, req.params.boardID);

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members.map(e => e.response())));
    next();
});

export const getBoardMembersJoined: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, req.params.boardID, (board) => board.isJoined);

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members.map(e => e.response())));
    next();
});

export const acceptInvitation: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    await BoardService.joinBoard(email, req.params.boardID);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

export const listBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const boards = await BoardService.listBoards(email);

    json(res, newAPIResponse<BoardResponse[]>(StatusCodes.OK, boards.map(e => e.board.response(e.isAssign))));
    next();
});

export const getBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const board = await BoardService.getBoard(email, req.params.boardID);

    json(res, newAPIResponse<BoardResponse>(StatusCodes.OK, board.response()));
    next();
});
