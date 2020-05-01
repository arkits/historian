import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class History {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamp')
    timestamp: Date;

    @Column()
    type: string;

    @ManyToOne((type) => User)
    savedBy: User;

    @Column('jsonb')
    metadata: object;
}
