import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Board} from "./board.model";
import {Member} from "./member.model";

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

    @Column("text", {nullable: true})
    public tags: string;

    @Column("int", {default: 0})
    public capacity: number;

    constructor(board: Board, name: string, description: string | null = null) {
        this.board = board;
        this.name = name;
        this.description = description;
        this.tags = "[]";
    }
}
