import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('user_group')
export class UserGroup {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: ObjectId;

  @Column()
  groupId: ObjectId;

  @Column({ default: false })
  isAdmin: boolean;
}
