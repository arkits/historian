import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    name: string;

    @Column({
        primary: true,
        unique: true
    })
    username: string;

    @Column()
    password: string;
}
