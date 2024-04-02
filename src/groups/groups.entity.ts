import { Entries } from "src/entries/entries.entity";
import { Expenses } from "src/expenses/expenses.entity";
import { Users } from "src/users/users.entity";
import { Double, Entity, PrimaryGeneratedColumn,Column,JoinTable,ManyToMany, OneToMany, Unique, JoinColumn } from "typeorm";

@Entity('groups')
export class Groups{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    tagname: string;

    @Column()
    descricao: string;
    

    @ManyToMany(() => Users)
    @JoinTable({
      name: 'users_groups',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'groupId',
        referencedColumnName: 'id',
      },
    })
    
    @OneToMany(() => Expenses, (expense) => expense.group, {
        cascade: true,
      })
      @JoinTable()
      expense: Expenses[];

      @OneToMany(() => Entries, (entry) => entry.group, {
        cascade: true,
      })
      @JoinTable()
      Entry: Entries[];
    }
    
