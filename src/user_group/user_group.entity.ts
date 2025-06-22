import { Groups } from "src/groups/groups.entity";
import { Users } from "src/users/users.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Column } from "typeorm"; 

@Entity('user_group')
export class UserGroup {
  @PrimaryColumn({ name: 'group_id' })
  groupId: number;
  
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Column({ default: false }) 
  isAdmin: boolean;

  @ManyToOne(
    () => Groups,
    group => group.id,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  groups: Groups[];
  
  @ManyToOne(
    () => Users,
    user => user.id,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  users: Users[];
}