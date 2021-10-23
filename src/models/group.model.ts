import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Board} from "./board.model";
import {Member} from "./member.model";
import {GroupResponse} from "groupo-shared-service/apiutils/messages";

@Entity("group")
export class Group {
    @PrimaryGeneratedColumn("uuid", {name: "group_id"}) groupID: string;

    @ManyToOne(() => Board, board => board.groups, {eager: true})
    @JoinColumn({name: "board_id"})
    board: Board;

    @OneToMany(() => Member, member => member.group, {cascade: true})
    members: Promise<Member[]>;

    @Column({length: 255, name: "name"}) name: string;
    @Column("text", {nullable: true}) description: string;

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

    constructor(board: Board, name: string, description: string | null = null) {
        this.board = board;
        this.name = name;
        this.description = description;
    }

    // since typeorm does not work on cyclic, we have to assign cyclic field by ourself
    async getMembers(): Promise<Member[]> {
        return (await this.members).map(member => {
            member.board = this.board;
            member.group = this;
            return member;
        });
    }

    async response(): Promise<GroupResponse> {
        return {
            groupID: this.groupID,
            description: this.description,
            members: [],
            name: this.name,
        };
    }
}
