import express from "express";
import {catcher} from "groupo-shared-service/apiutils/errors";
import * as BoardService from "../services/board.service";
import {
    BoardInvitationRequest,
    BoardResponse,
    CreateBoardRequest,
    CreateBoardResponse,
    json,
    MemberResponse,
    newAPIResponse
} from "groupo-shared-service/apiutils/messages";
import {StatusCodes} from "http-status-codes";
import {io} from "../socketio";
import {JoinSocketIOEvent} from "../socketio/handler";
import {getExpressRequestContext} from "groupo-shared-service/services/express";

const getBoardID = (req: express.Request): string => {
    return req.params.boardID;
};

/**
 * create a new board with specific groups and tags
 */
export const create: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<CreateBoardRequest>(req);

    const boardID = await BoardService.create(ctx);

    json(res, newAPIResponse<CreateBoardResponse>(StatusCodes.OK, {boardID}));
    next();
});

/**
 * add new members to a board (only owner)
 */
export const addMember: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<BoardInvitationRequest>(req);

    await BoardService.addMember(ctx, getBoardID(req));

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});


/**
 * list all members of the board
 */
export const join: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<undefined>(req);

    const boardID = getBoardID(req);
    await BoardService.join(ctx, boardID);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    io.to(boardID).emit(JoinSocketIOEvent, ctx.email);
    next();
});

/**
 * list all members of the board
 */
export const listMember: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<undefined>(req);

    const members = await BoardService.listMembers(ctx, getBoardID(req));

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members));
    next();
});

/**
 * list all boards that the `email` is a member
 */
export const listBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<undefined>(req);

    const boards = await BoardService.listBoards(ctx);

    json(res, newAPIResponse<BoardResponse[]>(StatusCodes.OK, boards));
    next();
});

/**
 * get board information
 */
export const findBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<undefined>(req);

    json(res, newAPIResponse<BoardResponse>(StatusCodes.OK, await BoardService.findByID(ctx, getBoardID(req))));
    next();
});

/**
 * add new members to a board (only owner)
 */
export const updateMemberTags: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = getExpressRequestContext<BoardInvitationRequest>(req);

    await BoardService.updateMemberTags(ctx.email, req.params.boardID, req.body);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});
