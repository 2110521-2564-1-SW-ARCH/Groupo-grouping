import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./group.model";
import {Tag} from "./tag.model";
import {Member} from "./member.model";
import {BoardResponse, GroupResponse} from "groupo-shared-service/apiutils/messages";

@Entity("board")
export class Board {
    @PrimaryGeneratedColumn("uuid", {name: "board_id"}) boardID: string;

    @Column({length: 255, name: "owner"}) owner: string;
    @Column({length: 255, name: "name"}) name: string;
    @Column("int", {name: "total_group"}) totalGroup: number;

    @OneToMany(() => Group, group => group.board, {cascade: true, eager: true})
    groups: Group[];

    @OneToMany(() => Tag, tag => tag.board, {cascade: true, eager: true})
    tags: Tag[];

    @OneToMany(() => Member, member => member.board, {cascade: true, eager: true})
    members: Member[];

    constructor(owner: string, name: string, totalGroup: number) {
        this.owner = owner;
        this.name = name;
        this.totalGroup = totalGroup;
    }

    response(isAssign: boolean = false): BoardResponse {
        let membersNoGroup: string[] = [];

        let groups: GroupResponse[] = this.groups.map(group => ({
            groupID: group.groupID,
            name: group.name,
            description: group.description,
            members: [],
        }));

        for (let member of this.members) {
            if (member.group) {
                let groupID = member.group.groupID;
                groups.find(group => group.groupID == groupID).members.push(member.email);
            } else {
                membersNoGroup.push(member.email);
            }
        }

        return {
            boardID: this.boardID,
            isAssign,
            members: this.members.map(m => m.email),
            membersNoGroup,
            name: this.name,
            owner: this.owner,
            totalGroup: this.totalGroup,
            totalMember: this.members.length,
            groups,
        };
    }
}
