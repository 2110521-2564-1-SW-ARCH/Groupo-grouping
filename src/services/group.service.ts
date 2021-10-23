import {getConnection} from "typeorm";
import {Group} from "../models/group.model";
import {NotFoundError} from "groupo-shared-service/apiutils/errors";
import {Member} from "../models/member.model";
import * as BoardService from "../services/board.service";

const save = async (group: Group) => {
    await getConnection().getRepository(Group).save(group);
};

/**
 * create group with specific `name` and `description`
 * @param owner
 * @param boardID
 * @param name
 * @param description
 */
export const create = async (owner: string, boardID: string, name: string, description: string | null = null): Promise<string> => {
    const board = await BoardService.findByOwnerAndID(owner, boardID);

    const group = new Group(board, name, description);

    await save(group);

    return group.groupID;
};

/**
 * get group by ID
 * @param groupID
 */
export const findByID = async (groupID: string): Promise<Group> => {
    return await getConnection().getRepository(Group).findOneOrFail({where: {groupID}});
};

/**
 * get group by ID and owner email
 * @param owner
 * @param groupID
 */
export const findByOwnerAndID = async (owner: string, groupID: string): Promise<Group> => {
    const group = await findByID(groupID);
    const board = await group.board;
    if (board.owner !== owner) {
        throw new NotFoundError();
    }
    return group;
};

/**
 * update group information (name, description)
 * @param owner
 * @param groupID
 * @param name
 * @param description
 */
export const update = async (owner: string, groupID: string, name: string | null = null, description: string | null = null) => {
    const group = await findByOwnerAndID(owner, groupID);

    group.name = name || group.name;
    group.description = description;

    await save(group);
};

/**
 * remove group by ID
 * @param owner
 * @param groupID
 */
export const remove = async (owner: string, groupID: string) => {
    const group = await findByOwnerAndID(owner, groupID);
    await getConnection().getRepository(Group).delete(group);
};

/**
 * transit user to another group
 * @param email
 * @param fromGroupID
 * @param toGroupID
 */
export const transit = async (email: string, fromGroupID: string, toGroupID: string) => {
    console.log(email, fromGroupID, toGroupID);
};
