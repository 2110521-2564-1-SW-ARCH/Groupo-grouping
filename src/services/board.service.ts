import {getConnection} from "typeorm";
import {Board} from "../models/board.model";
import {Tag} from "../models/tag.model";
import {Group} from "../models/group.model";
import {Member} from "../models/member.model";
import {UnauthorizedError} from "groupo-shared-service/apiutils/errors";

const save = async (board: Board) => {
    await getConnection().getRepository(Board).save(board);
};

/**
 * create new board with specific groups and tags
 * @param owner
 * @param name
 * @param totalGroup
 * @param tags
 */
export const create = async (owner: string, name: string, totalGroup: number, tags: Record<string, string[]>): Promise<string> => {
    const board = new Board(owner, name);
    await getConnection().getRepository(Board).insert(board);

    // pre create group
    const groups: Group[] = [];
    for (let i = 0; i < totalGroup; i++) {
        groups.push(new Group(board, `Group ${i+1}`));
    }
    board.groups = Promise.resolve(groups);

    // pre create tag
    const tagList: Tag[] = [];
    for (const tag of Object.keys(tags)) {
        for (const value of tags[tag]) {
            tagList.push(new Tag(tag, value, board));
        }
    }
    board.tags = tagList;

    // automatically set owner to be a member of the board
    board.members = [new Member(owner, board)];

    await save(board);

    return board.boardID;
};

/**
 * get board by ID
 * @param boardID
 */
export const findByID = async (boardID: string): Promise<Board> => {
    return await getConnection().getRepository(Board).findOneOrFail({where: {boardID}});
};

/**
 * get board by ID and owner email
 * @param owner
 * @param boardID
 */
export const findByOwnerAndID = async (owner: string, boardID: string): Promise<Board> => {
    return await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});
};

/**
 * add new members to specific `boardID`
 * @param owner
 * @param boardID
 * @param members
 */
export const addMember = async (owner: string, boardID: string, members: string[]) => {
    const board = await findByOwnerAndID(owner, boardID);

    const memberSet: Set<string> = new Set(board.members.map(e => e.email));
    for (const member of members) {
        if (memberSet.has(member)) {
            continue;
        }
        board.members.push(new Member(member, board));
    }
    await save(board);
};

/**
 * join board with `boardID`
 * @param email
 * @param boardID
 */
export const join = async (email: string, boardID: string) => {
    const board = await findByID(boardID);
    board.members.push(new Member(email, board));
    await save(board);
};

/**
 * list all member for specific `boardID`
 * @param owner
 * @param boardID
 * @param filter
 */
export const listMember = async (owner: string, boardID: string, filter: (member: Member) => boolean = () => true): Promise<Member[]> => {
    const board = await findByID(boardID);
    if (!board.members.map(m => m.email).includes(owner)) {
        throw new UnauthorizedError("user cannot access this board");
    }
    return board.members.filter(filter);
};

/**
 * list all boards that this `email` is a member
 * @param email
 */
export const findAll = async (email: string): Promise<{board: Board, isAssign: boolean}[]> => {
    const members = await getConnection()
        .createQueryBuilder(Member, "member")
        .where("member.email = :email", {email})
        .leftJoinAndSelect("member.board", "board")
        .leftJoinAndSelect("board.members", "m")
        .getMany();

    return members.map(member => ({board: member.board, isAssign: !!member.group}));
};
