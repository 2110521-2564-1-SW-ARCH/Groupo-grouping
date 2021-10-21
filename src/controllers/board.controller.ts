import express from "express";
import {catcher} from "groupo-shared-service/apiutils/errors";
import * as BoardService from "../services/board.service";
import {
    BoardInvitationRequest,
    BoardResponse,
    CreateBoardRequest,
    CreateBoardResponse,
    CreateGroupRequest,
    CreateGroupResponse,
    json,
    newAPIResponse
} from "groupo-shared-service/apiutils/messages";
import {verifyAuthorizationHeader} from "groupo-shared-service/services/authentication";
import {StatusCodes} from "http-status-codes";
import { MemberResponse } from "../models/member.model";

export const createBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {name, totalGroup, tags} = req.body as CreateBoardRequest;

    const boardID = await BoardService.createBoard(email, name, totalGroup, tags);

    json(res, newAPIResponse<CreateBoardResponse>(StatusCodes.OK, {boardID}));
    next();
});

export const createGroup: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {boardID, name, description} = req.body as CreateGroupRequest;

    const groupID = await BoardService.createGroup(email, boardID, name, description);

    json(res, newAPIResponse<CreateGroupResponse>(StatusCodes.OK, {boardID, groupID}));
    next();
});

export const updateGroup: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {groupID} = req.params;
    const {name, description} = req.body;

    await BoardService.updateGroup(email, groupID, name, description);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

export const deleteGroup: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {groupID} = req.params;

    await BoardService.deleteGroup(email, groupID);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

export const assignToGroup: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let {groupID, email} = req.body;
    const {boardID} = req.params;

    if (!email) {
        email = verifyAuthorizationHeader(req);
    } else {
        const owner = verifyAuthorizationHeader(req).email;
        await BoardService.checkOwnership(owner, boardID);
    }

    await BoardService.assignToGroup(email, boardID, groupID);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

export const addMember: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {members} = req.body as BoardInvitationRequest;

    await BoardService.addMember(email, req.params.boardID, members);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

export const getBoardInvitations: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, req.params.boardID, (board) => !board.isJoined);

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members.map(e => e.response())));
});

export const getBoardMembers: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, req.params.boardID);

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members.map(e => e.response())));
});

export const getBoardMembersJoined: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, req.params.boardID, (board) => board.isJoined);

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members.map(e => e.response())));
});

export const acceptInvitation: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const member = await BoardService.acceptInvitation(req.params.boardID, email);

    json(res, newAPIResponse<MemberResponse>(StatusCodes.OK, member.response()));
});

export const listBoard: express.Handler = catcher(async (req: express.Request, res: express.Response) => {
    const {email} = verifyAuthorizationHeader(req);

    const boards = await BoardService.listBoards(email);

    let boardsResponse = [];

    for (let board of boards) {
        boardsResponse.push(await board.board.response(board.isAssign));
    }

    json(res, newAPIResponse<BoardResponse[]>(StatusCodes.OK, boardsResponse));
});

export const getBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const board = await BoardService.getBoard(email, req.params.boardID);

    json(res, newAPIResponse<BoardResponse>(StatusCodes.OK, await board.response()));
    next();
});
