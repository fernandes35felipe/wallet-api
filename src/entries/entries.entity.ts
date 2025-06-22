import { Groups } from "src/groups/groups.entity";
import { Users } from "src/users/users.entity";
import { Double, Entity, PrimaryGeneratedColumn,Column,JoinTable,ManyToMany, JoinColumn, OneToOne, OneToMany, ManyToOne} from "typeorm";
@Entity('entries')
export class Entries {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    @Column()
    description: string

    @Column("decimal", {scale: 2})
    value: Number
    
    @Column({nullable: true, type: 'date'})
    date: string

    @Column()
    recurrent: string

    @Column()
    recurrence_time: number

    @Column()
    font: string

    @Column()
    user_id: number

    @JoinColumn({name: 'user_id'})
    @ManyToOne(()=>Users, (users)=>users.id)
    user: number

    @Column() 
    group_id: number

    @JoinColumn({name: 'group_id'})
    @ManyToOne(()=>Groups, (group)=>group.id) 
    group: number
}