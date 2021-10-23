import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Group} from "./group.model";
import {Tag} from "./tag.model";
import {Member} from "./member.model";
import {BoardResponse} from "groupo-shared-service/apiutils/messages";

@Entity("board")
export class Board {
    @PrimaryGeneratedColumn("uuid", {name: "board_id"}) boardID: string;

    @Column({length: 255, name: "owner"}) owner: string;
    @Column({length: 255, name: "name"}) name: string;

    @OneToMany(() => Group, group => group.board, {cascade: true})
    groups: Promise<Group[]>;

    @OneToMany(() => Tag, tag => tag.board, {cascade: true, eager: true})
    tags: Tag[];

    @OneToMany(() => Member, member => member.board, {cascade: true, eager: true})
    members: Member[];

    @CreateDateColumn({
        name: "created_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    public createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
    })
    public updatedAt: Date;

    constructor(owner: string, name: string) {
        this.owner = owner;
        this.name = name;
    }

    async response(isAssign: boolean = false): Promise<BoardResponse> {
        const groups = (await this.groups).map(group => group.response());

        return {
            boardID: this.boardID,
            isAssign,
            members: this.members.map(member => member.response()),
            name: this.name,
            owner: this.owner,
            groups,
        };
    }
}
