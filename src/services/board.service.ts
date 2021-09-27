import {getConnection} from "typeorm";
import {Board} from "../models/board.model";
import {Tag} from "../models/tag.model";
import {Group} from "../models/group.model";
import {Member} from "../models/member.model";
import {InternalServerError, NotFoundError} from "groupo-shared-service/apiutils/errors";

const findMemberByEmail = async (email: string, boardID?: string): Promise<Member[]> => {
    let query = await getConnection().createQueryBuilder(Member, "member").where("member.email = :email", {email});

    if (boardID) {
        query = query.andWhere("member.board_id = :boardID", {boardID});
    }

    return await query.leftJoinAndSelect("member.board", "board").leftJoinAndSelect("board.members", "m").getMany();
};

const findBoardByOwner = async (owner: string, boardID: string): Promise<Board> => {
    return await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});
};

const insertBoard = async (board: Board) => {
    await getConnection().getRepository(Board).insert(board);
};

const saveBoard = async (board: Board) => {
    await getConnection().getRepository(Board).save(board);
};

export const createBoard = async (owner: string, name: string, totalGroup: number, tags: Record<string, string[]>): Promise<string> => {
    const board = new Board(owner, name, totalGroup);
    await insertBoard(board);

    const groups: Group[] = [];
    for (let i = 0; i < totalGroup; i++) {
        groups.push(new Group(board));
    }
    board.groups = groups;

    const tagList: Tag[] = [];
    for (const tag of Object.keys(tags)) {
        for (const value of tags[tag]) {
            tagList.push(new Tag(tag, value, board));
        }
    }
    board.tags = tagList;

    board.members = [new Member(owner, board)];

    await saveBoard(board);

    return board.boardID;
};

export const addMember = async (owner: string, boardID: string, members: string[]) => {
    const board = await findBoardByOwner(owner, boardID);

    const memberSet: Set<string> = new Set(board.members.map(e => e.email));
    for (const member of members) {
        if (memberSet.has(member)) {
            continue;
        }
        board.members.push(new Member(member, board));
    }
    await saveBoard(board);
};

export const listBoards = async (email: string): Promise<{board: Board, isAssign: boolean}[]> => {
    const members = await findMemberByEmail(email);

    return members.map(m => ({board: m.board, isAssign: !!m.group}));
};

export const getBoard = async (email: string, boardID: string): Promise<Board> => {
    const members = await findMemberByEmail(email, boardID);

    if (members.length === 0) {
        throw new NotFoundError();
    } else if (members.length !== 1) {
        throw new InternalServerError("multiple board is found");
    }

    return members[0].board;
};
