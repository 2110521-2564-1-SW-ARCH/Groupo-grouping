import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
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

    @OneToMany(() => Group, group => group.board, {cascade: true})
    groups: Promise<Group[]>;

    @OneToMany(() => Tag, tag => tag.board, {cascade: true, eager: true})
    tags: Tag[];

    @OneToMany(() => Member, member => member.board, {cascade: true, eager: true})
    members: Member[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    constructor(owner: string, name: string, totalGroup: number) {
        this.owner = owner;
        this.name = name;
        this.totalGroup = totalGroup;
    }

    async response(isAssign: boolean = false): Promise<BoardResponse> {
        let membersNoGroup: string[] = [];

        let groupsModel = await this.groups;

        let groups: GroupResponse[] = groupsModel.map(group => ({
            groupID: group.groupID,
            name: group.name,
            description: group.description,
            members: [],
            created_at: group.created_at,
        }));

        groups.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

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
